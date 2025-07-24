package pkg

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal"
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
	mu                sync.Mutex
}

type Room struct {
	RoomID       string
	Name         string
	Gamemode     string
	IsOpen       bool
	HostID       string
	MaxPlayers   int
	PlayersCount int
	Clients      map[*websocket.Conn]*UserInfo
}

type PlayerInfo struct {
	X, Y     int
	PlayerID string `json:"playerId"`
	Nickname string `json:"nickname"`
}

type UserInfo struct {
	UserID   string `json:"userId"`
	Nickname string `json:"nickname"`
	IsReady  bool   `json:"is_ready"`
}

type Game struct {
	GameID  string
	Type    string
	RoomID  string
	Players map[*websocket.Conn]*PlayerInfo
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

func (h *WebSocketHandler) HandleConnectionInRoom(w http.ResponseWriter, r *http.Request, roomID string) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	var authMsg struct {
		Type string            `json:"type"`
		Data map[string]string `json:"data"`
	}

	if err := conn.ReadJSON(&authMsg); err != nil || authMsg.Type != "auth" {
		conn.WriteJSON(map[string]string{"error": "Authentication required"})
		conn.Close()
		return
	}

	userID := authMsg.Data["userId"]
	nickname := authMsg.Data["nickname"]

	if roomID == "" || userID == "" {
		http.Error(w, "room_id and user_id are required", http.StatusBadRequest)
		return
	}

	h.registerConnection(conn, roomID, userID, nickname)

	msg := map[string]interface{}{
		"type": "user_joined",
		"data": map[string]string{
			"userId":   userID,
			"nickname": nickname,
		},
	}
	h.sendMessageInsideRoom(conn, roomID, msg)
	h.sendRoomInfo(conn, roomID)

	msg = map[string]interface{}{
		"type": "add_user",
		"data": map[string]string{
			"roomId":   roomID,
			"userId":   userID,
			"nickname": nickname,
		},
	}
	h.sendMessageGlobal(msg)

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
			msgResponse := map[string]interface{}{
				"type": "leave_ack",
				"data": map[string]string{
					"roomId":   roomID,
					"userId":   msg.Data["userId"],
					"nickname": msg.Data["nickname"],
				},
			}
			if err := conn.WriteJSON(msgResponse); err != nil {
				log.Printf("WebSocket error: %v", err)
			}
			h.unregisterConnection(conn, roomID, userID)
		case "start_game":
			log.Printf("Attempt to start game from user: %s", userID)
			h.handleStartGame(conn, roomID, msg.Data["userId"], msg.Data["gameType"])
			msg := map[string]interface{}{
				"type": "delete_room_g",
				"data": map[string]string{
					"roomId": roomID,
				},
			}
			h.sendMessageGlobal(msg)
			h.sendMessageInsideRoomToAll(roomID, msg)
			//h.unregisterConnection(conn, roomID, userID)
		case "ready_state":
			h.updateReadyState(conn, roomID)
			msg := map[string]interface{}{
				"type": "update_ready_state",
				"data": map[string]interface{}{
					"isReady": h.rooms[roomID].Clients[conn].IsReady,
					"userId":  userID,
				},
			}
			h.sendMessageInsideRoomToAll(roomID, msg)
		}
	}
}

func (h *WebSocketHandler) updateReadyState(conn *websocket.Conn, roomID string) {
	user := h.rooms[roomID].Clients[conn]
	user.IsReady = !user.IsReady
}

func (h *WebSocketHandler) HandleCreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var request struct {
		Nickname string `json:"nickname"`
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
		RoomID:       request.RoomID,
		Name:         request.Name,
		Gamemode:     request.Gamemode,
		IsOpen:       request.IsOpen,
		HostID:       request.HostID,
		MaxPlayers:   5,
		PlayersCount: 1,
		Clients:      make(map[*websocket.Conn]*UserInfo),
	}

	h.rooms[request.RoomID] = room

	msg := map[string]interface{}{
		"type": "room_create",
		"room": map[string]interface{}{
			"roomId":       room.RoomID,
			"name":         room.Name,
			"gamemode":     room.Gamemode,
			"isOpen":       room.IsOpen,
			"userId":       room.HostID,
			"maxPlayers":   5,
			"playersCount": 1,
		},
		"user": map[string]interface{}{
			"userId":   request.HostID,
			"nickname": request.Nickname,
		},
	}
	h.sendMessageGlobal(msg)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	resp := map[string]interface{}{
		"roomId": request.RoomID,
		"ws_url": "ws://87.228.90.3:8080/ws/room_" + request.RoomID,
	}
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Printf("WebSocket error: %v", err)
	}
}

func (h *WebSocketHandler) HandleGlobalUpdates(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	h.globalSubscribers[conn] = true

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
	var rooms []map[string]interface{}
	for _, room := range h.rooms {
		rooms = append(rooms, map[string]interface{}{
			"roomId":   room.RoomID,
			"name":     room.Name,
			"gamemode": room.Gamemode,
			"isOpen":   room.IsOpen,
			"userId":   room.HostID,
		})
	}
	return rooms
}

func (h *WebSocketHandler) registerConnection(conn *websocket.Conn, roomID, userID, nickname string) {
	log.Printf("Registering connection for user %s", nickname)
	if _, exists := h.rooms[roomID]; !exists {
		h.rooms[roomID] = &Room{
			MaxPlayers:   5,
			PlayersCount: 1,
			RoomID:       roomID,
			Clients:      make(map[*websocket.Conn]*UserInfo),
		}
	}
	if h.rooms[roomID].PlayersCount < h.rooms[roomID].MaxPlayers {
		h.rooms[roomID].PlayersCount++
	}
	h.rooms[roomID].Clients[conn] = &UserInfo{
		IsReady:  false,
		UserID:   userID,
		Nickname: nickname,
	}
	h.globalSubscribers[conn] = true
}

func (h *WebSocketHandler) unregisterConnection(conn *websocket.Conn, roomID, userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	log.Printf("Unregistering connection for user %s", userID)
	room, exists := h.rooms[roomID]
	if !exists {
		return
	}
	clientInfo, ok := room.Clients[conn]
	if !ok {
		return
	}
	leaveMsg := map[string]interface{}{
		"type": "user_leaved_g",
		"data": map[string]interface{}{
			"roomId":   roomID,
			"userId":   clientInfo.UserID,
			"nickname": clientInfo.Nickname,
		},
	}

	h.sendMessageGlobal(leaveMsg)
	leaveMsg["type"] = "user_leaved_l"
	h.sendMessageInsideRoom(conn, roomID, leaveMsg)

	if room.PlayersCount > 0 {
		room.PlayersCount--
	}
	conn.Close()
	delete(room.Clients, conn)
	delete(h.globalSubscribers, conn)

	if room.PlayersCount == 0 || room.HostID == userID {
		deleteRoomMsg := map[string]interface{}{
			"type": "delete_room_g",
			"data": map[string]string{
				"roomId": roomID,
			},
		}
		h.sendMessageGlobal(deleteRoomMsg)
		deleteRoomMsg["type"] = "delete_room_l"
		h.sendMessageInsideRoom(conn, roomID, deleteRoomMsg)

		for conn := range room.Clients {
			conn.Close()
			delete(room.Clients, conn)
		}
		delete(h.rooms, roomID)
	}

	if err := conn.Close(); err != nil {
		log.Printf("Error closing websocket connection: %v", err)
	}
}

func (h *WebSocketHandler) sendRoomInfo(conn *websocket.Conn, roomID string) {
	room, exists := h.rooms[roomID]
	if !exists {
		return
	}
	users := make([]UserInfo, 0, len(room.Clients))
	for _, client := range room.Clients {
		users = append(users, UserInfo{
			IsReady:  false,
			UserID:   client.UserID,
			Nickname: client.Nickname,
		})
	}

	conn.WriteJSON(map[string]interface{}{
		"type":  "room_info",
		"users": users,
	})
}

func (h *WebSocketHandler) sendMessageGlobal(msg map[string]interface{}) {
	for conn := range h.globalSubscribers {
		if err := conn.WriteJSON(msg); err != nil {
			fmt.Println("Error writing to client, G")
			if err := conn.Close(); err != nil {
				fmt.Println("Error conn closing to client, G")
			}
			h.mu.Lock()
			delete(h.globalSubscribers, conn)
			h.mu.Unlock()
		}
	}
}

func (h *WebSocketHandler) sendMessageInsideRoomToAll(roomID string, msg map[string]interface{}) {
	room, exists := h.rooms[roomID]
	if !exists {
		return
	}
	for conn := range room.Clients {
		if err := conn.WriteJSON(msg); err != nil {
			fmt.Println("Error writing to client")
			if err := conn.Close(); err != nil {
				fmt.Println("Error conn closing to client")
			}
			h.mu.Lock()
			delete(room.Clients, conn)
			h.mu.Unlock()
		}
	}
}
func (h *WebSocketHandler) sendMessageInsideRoom(userConn *websocket.Conn, roomID string, msg map[string]interface{}) {
	room, exists := h.rooms[roomID]
	if !exists {
		return
	}
	for conn := range room.Clients {
		if conn != userConn {
			if err := conn.WriteJSON(msg); err != nil {
				if err := conn.Close(); err != nil {
					fmt.Println("Error conn closing to client")
					return
				}
				h.mu.Lock()
				delete(room.Clients, conn)
				h.mu.Unlock()
			}
		}
	}
}
func (h *WebSocketHandler) sendMessageInsideGame(playerConn *websocket.Conn, gameID string, msg map[string]interface{}) {
	game, exists := h.activeGames[gameID]
	if !exists {
		return
	}
	for conn := range game.Players {
		if conn != playerConn {
			if err := conn.WriteJSON(msg); err != nil {
				if err := conn.Close(); err != nil {
					fmt.Println("Error conn closing to client")
					return
				}
				h.mu.Lock()
				delete(game.Players, conn)
				h.mu.Unlock()
			}
		}
	}
}

func (h *WebSocketHandler) HandleGameConnection(w http.ResponseWriter, r *http.Request, gameID string) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Game WS upgrade failed: %v", err)
		return
	}

	game, exists := h.activeGames[gameID]
	if !exists {
		conn.WriteJSON(map[string]string{"error": "Game not found"})
		conn.Close()
		return
	}

	var auth struct {
		Type string            `json:"type"`
		Data map[string]string `json:"data"`
	}

	if err := conn.ReadJSON(&auth); err != nil || auth.Type != "game_auth" {
		conn.Close()
		return
	}

	h.mu.Lock()
	game.Players[conn] = &PlayerInfo{
		X:        internal.GeneratePosition(),
		Y:        internal.GeneratePosition(),
		PlayerID: auth.Data["userId"],
		Nickname: auth.Data["nickname"],
	}
	h.mu.Unlock()
	fmt.Printf("Connect: %s + %s + len: %d\n", auth.Data["userId"], auth.Data["nickname"], len(game.Players))

	players := make([]*PlayerInfo, 0, len(game.Players))
	for _, player := range game.Players {
		if player.PlayerID != auth.Data["userId"] {
			fmt.Printf("MSG: %s + %s\n", player.PlayerID, auth.Data["userId"])
			players = append(players, &PlayerInfo{
				X:        player.X,
				Y:        player.Y,
				PlayerID: player.PlayerID,
				Nickname: player.Nickname,
			})
		}
	}

	conn.WriteJSON(map[string]interface{}{
		"type": "init_players",
		"data": map[string]interface{}{
			"players": players,
		},
	})

	msg := map[string]interface{}{
		"type": "join_player",
		"data": map[string]interface{}{
			"x":        game.Players[conn].X,
			"y":        game.Players[conn].Y,
			"userId":   auth.Data["userId"],
			"nickname": auth.Data["nickname"],
		},
	}
	h.sendMessageInsideGame(conn, gameID, msg)

	for {
		var msg struct {
			Type string                 `json:"type"`
			Data map[string]interface{} `json:"data"`
		}
		if err := conn.ReadJSON(&msg); err != nil {
			h.removePlayerFromGame(gameID, conn)
			conn.Close()
			return
		}
		switch msg.Type {
		//case "init_players":
		//
		//
		case "update_position":
			var positionData struct {
				X float64 `json:"x"`
				Y float64 `json:"y"`
			}
			//if err := json.Unmarshal(msg.Data["positions"], &positionData); err != nil {
			//	continue
			//}
			for otherConn, player := range game.Players {
				if otherConn != conn {
					otherConn.WriteJSON(map[string]interface{}{
						"type": "player_position",
						"data": map[string]interface{}{
							"playerId": player.PlayerID,
							"x":        positionData.X,
							"y":        positionData.Y,
						},
					})
				}
			}
			break
		case "update_players":
			break
		}
	}
}

func (h *WebSocketHandler) removePlayerFromGame(gameID string, conn *websocket.Conn) {
	game, exists := h.activeGames[gameID]
	if !exists {
		return
	}

	player, ok := game.Players[conn]
	if ok {
		delete(game.Players, conn)
		for otherConn := range game.Players {
			otherConn.WriteJSON(map[string]interface{}{
				"type": "player_left",
				"data": map[string]string{
					"playerId": player.PlayerID,
				},
			})
		}
	}
}

func (h *WebSocketHandler) handleStartGame(conn *websocket.Conn, roomID, userID, gameType string) {
	if ok := h.checkAuthToStartGame(conn, roomID, userID); !ok {
		return
	}

	if ok := h.checkUsersReadyToStartGame(conn, roomID); !ok {
		return
	}

	gameID := h.generateGameID(gameType)

	players := make(map[string]*PlayerInfo)
	for _, user := range h.rooms[roomID].Clients {
		players[user.UserID] = &PlayerInfo{
			PlayerID: user.UserID,
			Nickname: user.Nickname,
		}
	}

	startMsg := map[string]interface{}{
		"type": "start_game",
		"data": map[string]interface{}{
			"userId":   userID,
			"roomId":   roomID,
			"gameId":   gameID,
			"gameType": gameType,
			"players":  players,
		},
	}

	h.activeGames[gameID] = &Game{
		RoomID:  roomID,
		Type:    gameType,
		Players: make(map[*websocket.Conn]*PlayerInfo),
	}

	h.sendMessageInsideRoomToAll(roomID, startMsg)
}

func (h *WebSocketHandler) checkUsersReadyToStartGame(conn *websocket.Conn, roomID string) bool {
	for _, user := range h.rooms[roomID].Clients {
		if !user.IsReady {
			fmt.Println("Not all users ready to start game")
			msg := map[string]interface{}{
				"type": "not_all_ready",
			}
			conn.WriteJSON(msg)
			return false
		}
	}
	return true
}

func (h *WebSocketHandler) checkAuthToStartGame(conn *websocket.Conn, roomID string, userID string) bool {
	room := h.rooms[roomID]
	if room == nil {
		conn.WriteJSON(map[string]string{"error": "Room not found"})
		conn.Close()
		return false
	}

	if room.HostID != userID {
		conn.WriteJSON(map[string]string{"error": "Start game can only HOST user"})
		conn.Close()
		return false
	}
	return true
}

func (h *WebSocketHandler) generateGameID(gameType string) string {
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
