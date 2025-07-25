package models

type PlayerInfo struct {
	X, Y     int
	PlayerID string `json:"playerId"`
	Nickname string `json:"nickname"`
}

type UserInfo struct {
	UserID   string `json:"userId"`
	Nickname string `json:"nickname"`
	IsReady  bool   `json:"is_ready"`
}
