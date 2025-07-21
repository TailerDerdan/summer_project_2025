package main

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/pkg"
	"log"
	"net/http"
	"strings"
)

func main() {
	wsHandler := pkg.NewWebsocketHandler()
	http.HandleFunc("/ws/room/create", wsHandler.HandleCreateRoom)
	http.HandleFunc("/ws/room/", func(w http.ResponseWriter, r *http.Request) {
		roomID := strings.TrimPrefix(r.URL.Path, "/ws/room/")
		if roomID == "" {
			http.Error(w, "Room ID is required", http.StatusBadRequest)
			return
		}
		wsHandler.HandleConnectionInRoom(w, r, roomID)
	})
	http.HandleFunc("/ws/global-updates", wsHandler.HandleGlobalUpdates)

	http.HandleFunc("/ws/game/", func(w http.ResponseWriter, r *http.Request) {
		gameID := strings.TrimPrefix(r.URL.Path, "/ws/game/")
		wsHandler.HandleGameConnection(w, r, gameID)
	})
	log.Println("Websocket server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
