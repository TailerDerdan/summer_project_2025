package handlers

import (
	service "github.com/TailerDerdan/summer_project_2025/websocket/internal/services"
	"github.com/gorilla/websocket"
	"net/http"
)

type GameHandler struct {
	service  service.GameService
	upgrader websocket.Upgrader
}

func NewGameHandler(service service.GameService) *GameHandler {
	return &GameHandler{
		service: service,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
	}
}

func (h *GameHandler) HandleGameConnection(w http.ResponseWriter, r *http.Request, gameID string) {
	// Реализация обработки игрового соединения
}
