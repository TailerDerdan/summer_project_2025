package infrastructure

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	"net/http"
)

type IGameService interface {
	GeneratePosition() float64
	CreateGame(roomID, gameType string) *models.Game
	//StartGame(roomID, gameType string)
	SendMessageInsideGame(playerConn *websocket.Conn, gameID string, msg map[string]interface{}) error
	SendMessageInsideGameToAll(gameID string, msg map[string]interface{}) error
	CheckGameEndConditions(gameID string)
	RemovePlayerFromGame(gameID string, conn *websocket.Conn)
	PlayerKill(gameID, playerID string) error
	PlayerDeath(conn *websocket.Conn, gameID, playerID string) error
	PlayerRespawn(conn *websocket.Conn, gameID, playerID string) error
	StartTimer(conn *websocket.Conn, gameID string)
	RegisterPlayer(conn *websocket.Conn, gameID string, player *models.PlayerInfo) error
	UpdatePosition(conn *websocket.Conn, gameID, playerID string, data map[string]interface{}) error
	UpdateBullets(conn *websocket.Conn, gameID string, data map[string]interface{}) error
	SendInitialGameState(conn *websocket.Conn, gameID string) error
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
