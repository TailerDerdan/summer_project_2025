package models

type Msg struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

type MsgCreateRoom struct {
	PlayersCount int    `json:"playersCount"`
	MaxPlayers   int    `json:"maxPlayers"`
	Nickname     string `json:"nickname"`
	HostID       string `json:"userId"`
	Name         string `json:"name"`
	Gamemode     string `json:"gamemode"`
	IsOpen       bool   `json:"isOpen"`
	RoomID       string `json:"roomId"`
}
