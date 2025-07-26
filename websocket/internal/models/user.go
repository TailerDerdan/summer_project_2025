package models

type UserInfo struct {
	UserID   string `json:"userId"`
	Nickname string `json:"nickname"`
	IsReady  bool   `json:"is_ready"`
}
