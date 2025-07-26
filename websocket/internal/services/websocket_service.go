package services

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

type WebSocketService struct {
	globalSubscribers map[*websocket.Conn]bool
	upgrader          *websocket.Upgrader
	mu                sync.Mutex
}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		globalSubscribers: make(map[*websocket.Conn]bool),
		upgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (ws *WebSocketService) HandleGlobalUpdates(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	ws.globalSubscribers[conn] = true
	fmt.Println("Global subscriber connected, :)")
	for {
		if _, _, err := conn.NextReader(); err != nil {
			break
		}
	}
	fmt.Println("Global subscriber disconnected, :(")
	ws.mu.Lock()
	delete(ws.globalSubscribers, conn)
	ws.mu.Unlock()
}

func (ws *WebSocketService) SendMessageGlobal(msg map[string]interface{}) error {
	for conn := range ws.globalSubscribers {
		if err := conn.WriteJSON(msg); err != nil {
			fmt.Println("Error writing to client, G")
			if err := conn.Close(); err != nil {
				return fmt.Errorf("error conn closing to client, G")
			}
			ws.mu.Lock()
			delete(ws.globalSubscribers, conn)
			ws.mu.Unlock()
		}
	}
	return nil
}
