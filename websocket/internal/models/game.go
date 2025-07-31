package models

import (
	"github.com/gorilla/websocket"
	"sync"
	"time"
)

type Game struct {
	GameID            string
	Type              string
	RoomID            string
	Players           map[*websocket.Conn]*PlayerInfo
	Stats             map[string]*PlayerStats
	State             GameState
	StartTime         time.Time
	Duration          time.Duration
	Deaths            []PlayerDeathEvent
	Bullets           map[string]*BulletInfo
	ReadyCheck        map[string]bool
	Weapons           map[string]*Weapon
	WeaponSpawnPoints []SpawnPoint
	LastSpawnTime     time.Time
	mu                sync.RWMutex
}
type GameState struct {
	Winner    string `json:"winner,omitempty"`
	CountDown int    `json:"count_down"`
	Status    string `json:"status"`
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

type WeaponType string

const (
	WeaponPistol  WeaponType = "pistol"
	WeaponRifle   WeaponType = "rifle"
	WeaponShotgun WeaponType = "shotgun"
	WeaponSniper  WeaponType = "sniper"
)

type Weapon struct {
	ID    string     `json:"id"`
	Type  WeaponType `json:"type"`
	Ammo  int        `json:"ammo"`
	X     float64    `json:"x"`
	Y     float64    `json:"y"`
	IsUse bool       `json:"isUse"`
}

type PlayerWeapon struct {
	ID       string     `json:"id"`
	PlayerID string     `json:"playerId"`
	Type     WeaponType `json:"type"`
	Ammo     int        `json:"ammo"`
}

type SpawnPoint struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}
