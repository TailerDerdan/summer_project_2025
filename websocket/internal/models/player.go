package models

type PlayerInfo struct {
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	Dir      float64 `json:"dir"`
	PlayerID string  `json:"playerId"`
	Nickname string  `json:"nickname"`
}

type PlayerStats struct {
	Kills    int `json:"kills"`
	Deaths   int `json:"deaths"`
	Score    int `json:"score"`
	Position int `json:"position"`
}
