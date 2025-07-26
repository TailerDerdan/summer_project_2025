package models

import (
	"github.com/gorilla/websocket"
	"sync"
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
	Deaths    []PlayerDeathEvent
	Bullets   map[string]*BulletInfo
	mu        sync.RWMutex
}
type GameState struct {
	Winner string `json:"winner,omitempty"`
}

type PlayerDeathEvent struct {
	PlayerID  string `json:"playerId"`
	KillerID  string `json:"killerId"`
	Timestamp int64  `json:"timestamp"`
}

type BulletInfo struct {
	BulletID string  `json:"bulletId"`
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	Dir      float64 `json:"dir"`
	Speed    float64 `json:"speed"`
	OwnerID  string  `json:"ownerId"`
	Lifetime int     `json:"lifetime"`
}
