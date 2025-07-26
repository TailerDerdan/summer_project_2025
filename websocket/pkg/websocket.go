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
	"sort"
	"sync"
	"time"
)

type WebSocketHandler struct {
	rooms             map[string]*Room
	activeGames       map[string]*Game
	globalSubscribers map[*websocket.Conn]bool
	upgrader          websocket.Upgrader
	mu                sync.Mutex
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

//func (h *WebSocketHandler) getGameStats(gameID string) map[string]interface{} {
//    game, exists := h.activeGames[gameID]
//    if !exists {
//        return nil
//    }
//
//    stats := make(map[string]int)
//    for _, death := range game.Deaths {
//        stats[death.Cause]++
//        if death.KillerID != "" {
//            stats[death.KillerID]++
//        }
//    }
//
//    return map[string]interface{}{
//        "total_deaths": len(game.Deaths),
//        "by_killer":    statsByKiller,
//    }
//}

//func (h *WebSocketHandler) sendStatsToPlayers(gameID string) {
//    stats := h.getGameStats(gameID)
//    msg := map[string]interface{}{
//        "type": "game_stats",
//        "data": stats,
//    }
//
//    game := h.activeGames[gameID]
//    for conn := range game.Players {
//        conn.WriteJSON(msg)
//    }
//}
