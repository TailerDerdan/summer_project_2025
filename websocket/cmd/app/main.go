package main

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/handlers"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/services"
	"log"
	"net/http"
	"strings"
)

func main() {
	wsService := services.NewWebSocketService()
	roomService := services.NewRoomService(wsService)
	gameService := services.NewGameService(roomService)

	roomHandler := handlers.NewRoomHandler(roomService, gameService, wsService)
	gameHandler := handlers.NewGameHandler(gameService, wsService)
	//wsHandler := handlers.NewWebSocketHandler(gameService, roomService, wsService)

	http.HandleFunc("/ws/room/", func(w http.ResponseWriter, r *http.Request) {
		roomID := getRoomIDFromRequest(w, r)
		roomHandler.HandleRoomConnection(w, r, roomID)
	})
	http.HandleFunc("/ws/game/", func(w http.ResponseWriter, r *http.Request) {
		gameID := getGameIDFromRequest(w, r)
		gameHandler.HandleGameConnection2(w, r, gameID)
	})
	http.HandleFunc("/ws/room/create", roomHandler.HandleCreateRoom)
	http.HandleFunc("/ws/global-updates", wsService.HandleGlobalUpdates)
	log.Println("Websocket server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func getRoomIDFromRequest(w http.ResponseWriter, r *http.Request) string {
	roomID := strings.TrimPrefix(r.URL.Path, "/ws/room/")
	if roomID == "" {
		http.Error(w, "Room ID is required", http.StatusBadRequest)
		return ""
	}
	return roomID
}
func getGameIDFromRequest(w http.ResponseWriter, r *http.Request) string {
	gameID := strings.TrimPrefix(r.URL.Path, "/ws/game/")
	if gameID == "" {
		http.Error(w, "Game ID is required", http.StatusBadRequest)
		return ""
	}
	return gameID
}
