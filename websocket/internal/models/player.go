package models

type PlayerInfo struct {
	X, Y, Angle float64
	PlayerID    string `json:"playerId"`
	Nickname    string `json:"nickname"`
}

type PlayerStats struct {
	Kills    int `json:"kills"`
	Deaths   int `json:"deaths"`
	Score    int `json:"score"`
	Position int `json:"position"`
}
