package transport

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/services"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

type WebSocketHandler struct {
	gameService *services.GameService
	upgrader    websocket.Upgrader
}

func NewWebsocketHandler(s *services.GameService) *WebSocketHandler {
	return &WebSocketHandler{
		s,
		websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	defer conn.Close()

	roomId := r.URL.Query().Get("roomId")
	playerId := r.URL.Query().Get("playerId")

	h.gameService.HandlePlayer(conn, roomId, playerId)
}
