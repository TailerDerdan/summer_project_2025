package pkg

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"math/big"
	"net/http"
	"sync"
)

type WebSocketHandler struct {
	rooms             map[string]*Room
	activeGames       map[string]*Game
	globalSubscribers map[*websocket.Conn]bool
	upgrader          websocket.Upgrader
	mu                sync.RWMutex
}

type Room struct {
	RoomID   string
	Name     string
	Gamemode string
	IsOpen   bool
	HostID   string
	Clients  map[*websocket.Conn]UserInfo
}

type PlayerInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

type UserInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

type Game struct {
	ID      string
	Type    string
	RoomID  string
	Players map[*websocket.Conn]PlayerInfo
	State   GameState
	mu      sync.RWMutex
}

type GameState struct {
	Winner string `json:"winner,omitempty"`
}

func NewWebsocketHandler() *WebSocketHandler {
	return &WebSocketHandler{
		rooms:             make(map[string]*Room),
		activeGames:       make(map[string]*Game),
		globalSubscribers: make(map[*websocket.Conn]bool),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request, roomID string) {
	fmt.Println("0000")
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	fmt.Println("1111")
	var authMsg struct {
		Type string            `json:"type"`
		Data map[string]string `json:"data"`
	}
	fmt.Println("2222")
	if err := conn.ReadJSON(&authMsg); err != nil || authMsg.Type != "auth" {
		fmt.Println(authMsg.Type, "----", authMsg.Data)
		conn.WriteJSON(map[string]string{"error": "Authentication required"})
		conn.Close()
		return
	}
	fmt.Println("3333")
	userID := authMsg.Data["userId"]
	nickname := authMsg.Data["nickname"]
	fmt.Printf(`userID: %s roomID: %s`, userID, roomID)
	if roomID == "" || userID == "" {
		http.Error(w, "room_id and user_id are required", http.StatusBadRequest)
		return
	}

	h.registerConnection(conn, roomID, userID, nickname)
	defer h.unregisterConnection(conn, roomID, userID)

	h.sendRoomInfo(conn, roomID)
	h.notifyUserJoined(roomID, userID, nickname)

	for {
		var msg struct {
			Type string            `json:"type"`
			Data map[string]string `json:"data"`
		}

		if err := conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		switch msg.Type {
		case "leave_room":
			log.Printf("User %s requested to leave room %s", msg.Data["userId"], roomID)
			conn.WriteJSON(map[string]interface{}{
				"type": "leave_ack",
				"data": map[string]string{
					"userId":   msg.Data["userId"],
					"nickname": msg.Data["nickname"],
				},
			})
			return
		case "start_game":
			log.Printf("Attempt to start game from user: %s", userID)
			h.handleStartGame(conn, roomID, userID, msg.Data["gameType"])
			return
		}

	}
}

func (h *WebSocketHandler) checkAuthToStartGame(conn *websocket.Conn, roomID string, userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room := h.rooms[roomID]
	if room == nil {
		conn.WriteJSON(map[string]string{"error": "Room not found"})
		conn.Close()
		return
	}

	if room.HostID != userID {
		conn.WriteJSON(map[string]string{"error": "Start game can only HOST user"})
		conn.Close()
		return
	}
	return

}

func (h *WebSocketHandler) HandleCreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var request struct {
		HostID   string `json:"userId"`
		Name     string `json:"name"`
		Gamemode string `json:"gamemode"`
		IsOpen   bool   `json:"isOpen"`
		RoomID   string `json:"roomId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if _, exists := h.rooms[request.RoomID]; exists {
		http.Error(w, "Room already exists", http.StatusConflict)
		return
	}
	room := &Room{
		RoomID:   request.RoomID,
		Name:     request.Name,
		Gamemode: request.Gamemode,
		IsOpen:   request.IsOpen,
		HostID:   request.HostID,
		Clients:  make(map[*websocket.Conn]UserInfo),
	}
	h.mu.Lock()
	h.rooms[request.RoomID] = room
	h.mu.Unlock()

	h.broadcastSystemMessage(map[string]interface{}{
		"type": "room_create",
		"room": map[string]interface{}{
			"roomId":   room.RoomID,
			"name":     room.Name,
			"gamemode": room.Gamemode,
			"isOpen":   room.IsOpen,
			"userId":   room.HostID,
		},
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"roomId": request.RoomID,
		"ws_url": "ws://ws:8080/ws/room_" + request.RoomID,
	})
}

func (h *WebSocketHandler) broadcastSystemMessage(msg map[string]interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for conn := range h.globalSubscribers {
		if err := conn.WriteJSON(msg); err != nil {
			conn.Close()
			delete(h.globalSubscribers, conn)
		}
	}
}
func (h *WebSocketHandler) broadcastToRoom(roomID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for conn := range h.rooms[roomID].Clients {
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			conn.Close()
			delete(h.rooms[roomID].Clients, conn)
		}
	}
}

func (h *WebSocketHandler) HandleGlobalUpdates(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	h.mu.Lock()
	h.globalSubscribers[conn] = true
	h.mu.Unlock()

	rooms := h.getRoomList()
	msg := map[string]interface{}{
		"type":  "room_list",
		"rooms": rooms,
	}
	h.broadcastSystemMessage(msg)

	for {
		if _, _, err := conn.NextReader(); err != nil {
			break
		}
	}
	h.mu.Lock()
	delete(h.globalSubscribers, conn)
	h.mu.Unlock()
}

func (h *WebSocketHandler) getRoomList() []map[string]interface{} {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var rooms []map[string]interface{}
	for _, room := range h.rooms {
		rooms = append(rooms, map[string]interface{}{
			"id":       room.RoomID,
			"name":     room.Name,
			"gamemode": room.Gamemode,
			"isOpen":   room.IsOpen,
			"userId":   room.HostID,
		})
	}
	return rooms
}

func (h *WebSocketHandler) registerConnection(conn *websocket.Conn, roomID, userID, username string) {
	log.Printf("Registering connection for user %s", username)
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.rooms[roomID]; !exists {
		h.rooms[roomID] = &Room{
			RoomID:  roomID,
			Clients: make(map[*websocket.Conn]UserInfo),
		}
	}

	h.rooms[roomID].Clients[conn] = UserInfo{
		ID:       userID,
		Username: username,
	}

	h.globalSubscribers[conn] = true
}

func (h *WebSocketHandler) unregisterConnection(conn *websocket.Conn, roomID, userID string) {
	log.Printf("Unregistering connection for user %s", userID)
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, exists := h.rooms[roomID]; exists {
		if clientInfo, ok := room.Clients[conn]; ok {
			delete(room.Clients, conn)
			go h.notifyUserLeft(roomID, clientInfo)
		}

		if (len(room.Clients) == 0) || (room.HostID == userID) {
			fmt.Println("Host disconnected or 0 clients")
			delete(h.rooms, roomID)
		}
	}

	delete(h.globalSubscribers, conn)
	conn.Close()
}

func (h *WebSocketHandler) notifyUserJoined(roomID, userID, username string) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	msg := map[string]interface{}{
		"type": "user_joined",
		"data": map[string]string{
			"userId":   userID,
			"nickname": username,
		},
	}
	if room, exists := h.rooms[roomID]; exists {
		for clientConn := range room.Clients {
			if clientConn != nil && room.HostID != userID {
				clientConn.WriteJSON(msg)
			}
		}
	}
}

func (h *WebSocketHandler) sendRoomInfo(conn *websocket.Conn, roomID string) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if room, exists := h.rooms[roomID]; exists {
		users := make([]UserInfo, 0, len(room.Clients))
		for _, client := range room.Clients {
			users = append(users, UserInfo{
				ID:       client.ID,
				Username: client.Username,
			})
		}

		conn.WriteJSON(map[string]interface{}{
			"type":  "room_info",
			"users": users,
		})
	}
}

func (h *WebSocketHandler) notifyUserLeft(roomID string, clientInfo UserInfo) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if room, exists := h.rooms[roomID]; exists {
		msg := map[string]interface{}{
			"type": "user_leaved",
			"data": map[string]interface{}{
				"userId":   clientInfo.ID,
				"nickname": clientInfo.Username,
			},
		}
		for conn := range room.Clients {
			conn.WriteJSON(msg)
		}
	}
}

func (h *WebSocketHandler) HandleGameConnection(w http.ResponseWriter, r *http.Request, gameID string) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Game WS upgrade failed: %v", err)
		return
	}

	h.mu.RLock()
	game, exists := h.activeGames[gameID]
	h.mu.RUnlock()

	if !exists {
		conn.WriteJSON(map[string]string{"error": "Game not found"})
		conn.Close()
		return
	}

	var auth struct {
		Type string            `json:"userId"`
		Data map[string]string `json:"data"`
	}
	if err := conn.ReadJSON(&auth); err != nil {
		conn.Close()
		return
	}

	h.mu.Lock()
	game.Players[conn] = PlayerInfo{
		ID:       auth.Data["userId"],
		Username: auth.Data["username"],
	}
	h.mu.Unlock()
}

func (h *WebSocketHandler) handleStartGame(conn *websocket.Conn, roomID, userID, gameType string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.checkAuthToStartGame(conn, roomID, userID)
	gameID := generateGameID(gameType)

	startMsg := map[string]interface{}{
		"type": "start_game",
		"data": map[string]string{
			"gameId":   gameID,
			"gameType": gameType,
		},
	}

	room := h.rooms[roomID]

	h.activeGames[gameID] = &Game{
		RoomID: roomID,
		Type:   gameType,
	}

	for conn := range room.Clients {
		if err := conn.WriteJSON(startMsg); err != nil {
			log.Printf("Failed to send start command: %v", err)
		}
	}
}

func generateGameID(gameType string) string {
	const charset = "ABCDEFGHJIKLMNPOQRSTUVWXYZ0123456789"
	idPart := make([]byte, 9)

	for i := range idPart {
		if i == 4 {
			idPart[i] = '-'
			continue
		}
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		idPart[i] = charset[num.Int64()]
	}

	return fmt.Sprintf("%s-%s", gameType, string(idPart))
}
