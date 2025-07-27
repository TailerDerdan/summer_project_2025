package infrastructure

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	"net/http"
)

type IGameService interface {
	CreateGame(roomID, gameType string) *models.Game
	//StartGame(conn *websocket.Conn, roomID, userID, gameType string)
	SendMessageInsideGame(playerConn *websocket.Conn, gameID string, msg map[string]interface{})
	SendMessageInsideGameToAll(gameID string, msg map[string]interface{})
	CheckGameEndConditions(gameID string)
	RemovePlayerFromGame(gameID string, conn *websocket.Conn)
	EndGame(gameID string) error
	SendGameStatsUpdate(gameID string)
	PlayerKill(gameID, killerID, victimID string)
	PlayerDeath(gameID, playerID string)
	StartTimer(gameID string)
	RegisterPlayer(conn *websocket.Conn, gameID string, player *models.PlayerInfo) error
	GetGameState(gameID string) ([]models.PlayerInfo, error)
}

type IRoomService interface {
	CreateRoom(msgCreateRoom models.MsgCreateRoom) (*models.Room, error)
	//UpdateReadyState(conn *websocket.Conn, roomID string)
	//RegisterConnection(conn *websocket.Conn, roomID, userID, nickname string)
	UnregisterConnection(conn *websocket.Conn, roomID, userID string)
	SendRoomInfo(conn *websocket.Conn, roomID string)
	SendMessageInsideRoomToAll(roomID string, msg map[string]interface{}) error
	SendMessageInsideRoom(userConn *websocket.Conn, roomID string, msg map[string]interface{}) error
	//CheckUsersReadyToStartGame(conn *websocket.Conn, roomID string) bool
	//CheckAuthToStartGame(conn *websocket.Conn, roomID string, userID string) bool

	RegisterUser(conn *websocket.Conn, roomID string, user *models.UserInfo) error
	GetRoomState(roomID string) ([]models.UserInfo, error)
	StartGame(conn *websocket.Conn, roomID, userID, gameType string) error
	UserReady(conn *websocket.Conn, roomID string) error
	UserLeave(conn *websocket.Conn, roomID, userID string) error
	//UserJoin() error
	//DeleteRoom() error
}

type IWebSocketService interface {
	HandleGlobalUpdates(w http.ResponseWriter, r *http.Request)
	SendMessageGlobal(msg map[string]interface{}) error
}
