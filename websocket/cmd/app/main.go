package main

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/repository"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/services"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/transport"
	"log"
	"net/http"
)

func main() {
	symfonyRepository := repository.NewSymfonyRepository(
		"http://localhost:8000",
	)
	gameService := services.NewGameService(symfonyRepository)
	wsHandler := transport.NewWebsocketHandler(gameService)
	http.HandleFunc("/ws", wsHandler.HandleConnection)
	log.Println("Websocket server listening on :8080")
	log.Fatal(http.ListenAndServe(":8000", nil))
}
