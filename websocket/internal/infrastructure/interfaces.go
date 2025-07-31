package infrastructure

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	"net/http"
)

type IGameService interface {
	CreateGame(roomID string, data map[string]interface{}) *models.Game
	SendMessageInsideGame(playerConn *websocket.Conn, gameID string, msg map[string]interface{}) error
	SendMessageInsideGameToAll(gameID string, msg map[string]interface{}) error
	RemovePlayerFromGame(gameID string, conn *websocket.Conn)
	PlayerKill(gameID, playerID string) error
	PlayerDeath(gameID, playerID string) error
	StartTimer(gameID string)
	RegisterPlayer(conn *websocket.Conn, gameID string, player *models.PlayerInfo) error
	UpdatePosition(conn *websocket.Conn, gameID, playerID string, data map[string]interface{}) error
	UpdateBullets(conn *websocket.Conn, gameID string, data map[string]interface{}) error
	SendInitialGameState(conn *websocket.Conn, gameID string) error
	ChangeWeapon(conn *websocket.Conn, gameID string, data map[string]interface{}) error
	DropWeapon(conn *websocket.Conn, gameID string) error
	StartWaitingPlayers(gameID string)
	ReadyToBattle(conn *websocket.Conn, gameID string) error
	SetWeaponsPoints(gameID string, data map[string]interface{}) error
	GetGameState(gameID string) (*models.GameState, error)
}

type IRoomService interface {
	CreateRoom(msgCreateRoom models.MsgCreateRoom) (*models.Room, error)
	UnregisterConnection(conn *websocket.Conn, roomID, userID string)
	SendRoomInfo(conn *websocket.Conn, roomID string)
	SendMessageInsideRoomToAll(roomID string, msg map[string]interface{}) error
	SendMessageInsideRoom(userConn *websocket.Conn, roomID string, msg map[string]interface{}) error
	RegisterUser(conn *websocket.Conn, roomID string, user *models.UserInfo) error
	GetRoomState(roomID string) ([]models.UserInfo, error)
	StartGame(conn *websocket.Conn, roomID, userID string, data map[string]interface{}) error
	UserReady(conn *websocket.Conn, roomID string) error
	UserLeave(conn *websocket.Conn, roomID, userID string) error
}

type IWebSocketService interface {
	HandleGlobalUpdates(w http.ResponseWriter, r *http.Request)
	SendMessageGlobal(msg map[string]interface{}) error
}
