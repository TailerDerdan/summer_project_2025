package handlers

import (
	"github.com/gorilla/websocket"
	"net/http"
)

type RoomHandler struct {
	service  RoomService
	upgrader websocket.Upgrader
}

func NewRoomHandler(service RoomService) *RoomHandler {
	return &RoomHandler{
		service: service,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
	}
}

func (h *RoomHandler) HandleConnectionInRoom(w http.ResponseWriter, r *http.Request, roomID string) {
	// Реализация обработки комнаты
}

func (h *RoomHandler) HandleCreateRoom(w http.ResponseWriter, r *http.Request) {
	// Реализация создания комнаты
}
