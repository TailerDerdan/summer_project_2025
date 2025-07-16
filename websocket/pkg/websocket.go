package pkg

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strings"
	"sync"
)

type Room struct {
	ID          string
	Name        string
	Gamemode    string
	IsOpen      bool
	HostID      string
	Connections map[*websocket.Conn]bool
}

type WebSocketHandler struct {
	rooms             map[string]*Room
	globalSubscribers map[*websocket.Conn]bool
	upgrader          websocket.Upgrader
	mu                sync.RWMutex
}

func NewWebsocketHandler() *WebSocketHandler {
	return &WebSocketHandler{
		rooms:             make(map[string]*Room),
		globalSubscribers: make(map[*websocket.Conn]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // В production замените на проверку origin
			},
		},
	}
}

func (h *WebSocketHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	roomID := strings.TrimPrefix(r.URL.Path, "/ws/room_")
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	h.addConnection(roomID, conn)
	defer h.removeConnection(roomID, conn)
}

func (h *WebSocketHandler) HandleCreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var request struct {
		HostID   string `json:"hostId"`
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
		ID:          request.RoomID,
		Name:        request.Name,
		Gamemode:    request.Gamemode,
		IsOpen:      request.IsOpen,
		HostID:      request.HostID,
		Connections: make(map[*websocket.Conn]bool),
	}
	h.mu.Lock()
	h.rooms[request.RoomID] = room
	h.mu.Unlock()

	h.broadcastSystemMessage(map[string]interface{}{
		"type": "room_create",
		"room": map[string]interface{}{
			"roomId":   room.ID,
			"name":     room.Name,
			"gamemode": room.Gamemode,
			"isOpen":   room.IsOpen,
			"hostId":   room.HostID,
		},
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"roomId": request.RoomID,
		"ws_url": "ws://ws:8080/ws/room_" + request.RoomID,
	})
}

func (h *WebSocketHandler) addConnection(roomID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	room, exists := h.rooms[roomID]
	if !exists {
		room = &Room{
			ID:          roomID,
			Connections: make(map[*websocket.Conn]bool),
		}
		h.rooms[roomID] = room
	}
	room.Connections[conn] = true
}

func (h *WebSocketHandler) removeConnection(roomID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, exists := h.rooms[roomID]; exists {
		delete(room.Connections, conn)
		if len(room.Connections) == 0 {
			delete(h.rooms, roomID)
		}
	}
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

//func (h *WebSocketHandler) broadcastRoomList(roomId string) {
//	//rooms := h.getRoomList()
//	msg := map[string]interface{}{
//		"type": "room_create",
//		"room": h.rooms[roomId],
//	}
//
//	h.mu.RLock()
//	defer h.mu.RUnlock()
//
//	for conn := range h.globalSubscribers {
//		if err := conn.WriteJSON(msg); err != nil {
//			conn.Close()
//			delete(h.globalSubscribers, conn)
//		}
//	}
//}

func (h *WebSocketHandler) getRoomList() []map[string]interface{} {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var rooms []map[string]interface{}
	for _, room := range h.rooms {
		rooms = append(rooms, map[string]interface{}{
			"id":       room.ID,
			"name":     room.Name,
			"gamemode": room.Gamemode,
			"isOpen":   room.IsOpen,
			"hostId":   room.HostID,
		})
	}
	return rooms
}
