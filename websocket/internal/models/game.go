package models

import (
	"github.com/gorilla/websocket"
	"time"
)

type Game struct {
	GameID    string
	Type      string
	RoomID    string
	Players   map[*websocket.Conn]*PlayerInfo
	Stats     map[string]*PlayerStats
	State     GameState
	StartTime time.Time
	Duration  time.Duration
}

type GameState struct {
	Winner string `json:"winner,omitempty"`
}

type PlayerStats struct {
	Kills    int `json:"kills"`
	Deaths   int `json:"deaths"`
	Score    int `json:"score"`
	Position int `json:"position"`
}
