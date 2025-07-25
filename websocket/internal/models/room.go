package models

import "github.com/gorilla/websocket"

type Room struct {
	RoomID       string
	Name         string
	Gamemode     string
	IsOpen       bool
	HostID       string
	MaxPlayers   int
	PlayersCount int
	Clients      map[*websocket.Conn]*UserInfo
}
