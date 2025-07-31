package services

import (
	"fmt"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/infrastructure"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	"log"
	"sync"
)

type RoomService struct {
	rooms       map[string]*models.Room
	gameService infrastructure.IGameService
	wsService   infrastructure.IWebSocketService
	mu          sync.Mutex
}

func NewRoomService(gameService infrastructure.IGameService, wsService infrastructure.IWebSocketService) *RoomService {
	return &RoomService{
		rooms:       make(map[string]*models.Room),
		gameService: gameService,
		wsService:   wsService,
	}
}

func (rs *RoomService) CreateRoom(msgCreateRoom models.MsgCreateRoom) (*models.Room, error) {
	if _, exists := rs.rooms[msgCreateRoom.RoomID]; exists {
		return nil, fmt.Errorf("room already exists")
	}
	fmt.Printf("MaxPlayers: %d, PlayersCount: %d\n", msgCreateRoom.MaxPlayers, msgCreateRoom.PlayersCount)
	room := &models.Room{
		RoomID:       msgCreateRoom.RoomID,
		Name:         msgCreateRoom.Name,
		Gamemode:     msgCreateRoom.Gamemode,
		IsOpen:       msgCreateRoom.IsOpen,
		HostID:       msgCreateRoom.HostID,
		MaxPlayers:   msgCreateRoom.MaxPlayers,
		PlayersCount: msgCreateRoom.PlayersCount,
		Clients:      make(map[*websocket.Conn]*models.UserInfo),
	}
	rs.rooms[msgCreateRoom.RoomID] = room
	return room, nil
}

func (rs *RoomService) UnregisterConnection(conn *websocket.Conn, roomID, userID string) {
	log.Printf("Unregistering connection for user %s", userID)
	room, exists := rs.rooms[roomID]
	if !exists {
		return
	}
	clientInfo, ok := room.Clients[conn]
	if !ok {
		return
	}

	leaveMsg := map[string]interface{}{
		"type": "user_leaved_g_server",
		"data": map[string]interface{}{
			"roomId":   roomID,
			"userId":   clientInfo.UserID,
			"nickname": clientInfo.Nickname,
		},
	}

	if err := rs.wsService.SendMessageGlobal(leaveMsg); err != nil {
		log.Printf("Error sending leave msg: %v", err)
		return
	}
	leaveMsg["type"] = "user_leaved_l_server"
	err := rs.SendMessageInsideRoom(conn, roomID, leaveMsg)
	if err != nil {
		log.Println(err)
		return
	}

	if room.PlayersCount > 0 {
		room.PlayersCount--
	}
	conn.Close()

	if room.PlayersCount == 0 || room.HostID == userID {
		deleteRoomMsg := map[string]interface{}{
			"type": "delete_room_g_server",
			"data": map[string]string{
				"roomId": roomID,
			},
		}
		if err := rs.wsService.SendMessageGlobal(deleteRoomMsg); err != nil {
			log.Printf("Error sending delete room msg: %v", err)
			return
		}
		deleteRoomMsg["type"] = "delete_room_l_server"
		err := rs.SendMessageInsideRoom(conn, roomID, deleteRoomMsg)
		if err != nil {
			log.Println(err)
			return
		}

		for conn := range room.Clients {
			conn.Close()
			delete(room.Clients, conn)
		}
		delete(rs.rooms, roomID)
	}
	conn.Close()
	delete(room.Clients, conn)
}

func (rs *RoomService) SendRoomInfo(conn *websocket.Conn, roomID string) {
	room, exists := rs.rooms[roomID]
	if !exists {
		return
	}
	users := make([]models.UserInfo, 0, len(room.Clients))
	for _, client := range room.Clients {
		users = append(users, models.UserInfo{
			IsReady:  false,
			UserID:   client.UserID,
			Nickname: client.Nickname,
		})
	}

	if err := conn.WriteJSON(map[string]interface{}{
		"type":  "room_info_server",
		"users": users,
	}); err != nil {
		log.Printf("Error sending room info: %v", err)
	}
}

func (rs *RoomService) SendMessageInsideRoomToAll(roomID string, msg map[string]interface{}) error {
	room, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("room not found")
	}
	for conn := range room.Clients {
		if err := conn.WriteJSON(msg); err != nil {
			fmt.Println("Error writing to client")
			if err := conn.Close(); err != nil {
				return fmt.Errorf("error conn closing to client")
			}
			rs.mu.Lock()
			delete(room.Clients, conn)
			rs.mu.Unlock()
		}
	}
	return nil
}
func (rs *RoomService) SendMessageInsideRoom(userConn *websocket.Conn, roomID string, msg map[string]interface{}) error {
	room, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("room not found")
	}
	for conn := range room.Clients {
		if conn != userConn {
			if err := conn.WriteJSON(msg); err != nil {
				conn.Close()
				rs.mu.Lock()
				delete(room.Clients, conn)
				rs.mu.Unlock()
			}
		}
	}
	return nil
}

func (rs *RoomService) RegisterUser(conn *websocket.Conn, roomID string, user *models.UserInfo) error {
	//rs.mu.Lock()
	//defer rs.mu.Unlock()
	room, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("room not found")
	}
	if room.PlayersCount >= room.MaxPlayers {
		return fmt.Errorf("max players reached")
	}
	room.PlayersCount++
	room.Clients[conn] = &models.UserInfo{
		IsReady:  false,
		UserID:   user.UserID,
		Nickname: user.Nickname,
	}
	return nil
}

func (rs *RoomService) GetRoomState(roomID string) ([]models.UserInfo, error) {
	//rs.mu.Lock()
	//defer rs.mu.Unlock()
	room, exists := rs.rooms[roomID]
	if !exists {
		return nil, fmt.Errorf("room not found")
	}
	users := make([]models.UserInfo, 0, len(room.Clients))
	for _, client := range room.Clients {
		users = append(users, models.UserInfo{
			IsReady:  false,
			UserID:   client.UserID,
			Nickname: client.Nickname,
		})
	}
	return users, nil
}

func (rs *RoomService) UserLeave(conn *websocket.Conn, roomID, userID string) error {
	//rs.mu.Lock()
	//defer rs.mu.Unlock()
	room, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("room not found")
	}
	clientInfo := room.Clients[conn]
	leaveMsg := map[string]interface{}{
		"type": "leave_ack_server",
		"data": map[string]interface{}{
			"roomId":   roomID,
			"userId":   userID,
			"nickname": clientInfo.Nickname,
		},
	}
	if err := conn.WriteJSON(leaveMsg); err != nil {
		return fmt.Errorf("error sending leave ack: %v", err)
	}
	rs.UnregisterConnection(conn, roomID, userID)
	return nil
}
func (rs *RoomService) UserReady(conn *websocket.Conn, roomID string) error {
	//rs.mu.Lock()
	//defer rs.mu.Unlock()
	room := rs.rooms[roomID]
	user := room.Clients[conn]
	user.IsReady = !user.IsReady

	msg := map[string]interface{}{
		"type": "update_ready_state_server",
		"data": map[string]interface{}{
			"isReady": user.IsReady,
			"userId":  user.UserID,
		},
	}

	if err := rs.SendMessageInsideRoomToAll(roomID, msg); err != nil {
		return err
	}
	return nil
}

//	func (rs *RoomService) DeleteRoom() error {
//		return nil
//	}
func (rs *RoomService) StartGame(conn *websocket.Conn, roomID, userID string, data map[string]interface{}) error {
	//rs.mu.Lock()
	//defer rs.mu.Unlock()
	room, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("room not found")
	}
	if room.HostID != userID {
		return fmt.Errorf("only HOST user can start game")
	}
	for _, client := range room.Clients {
		if !client.IsReady {
			msg := map[string]interface{}{
				"type": "not_all_ready_server",
			}
			if err := conn.WriteJSON(msg); err != nil {
				if err := conn.Close(); err != nil {
					return fmt.Errorf("error closing to client")
				}
			}
			return nil
		}
	}

	fmt.Printf("map name: %v", data["mapName"])
	game := rs.gameService.CreateGame(roomID, data)
	msg := map[string]interface{}{
		"type": "start_game_server",
		"data": map[string]interface{}{
			"hostId":  room.HostID,
			"gameId":  game.GameID,
			"roomId":  roomID,
			"mapName": data["mapName"],
		},
	}
	fmt.Println("111111")
	if err := rs.SendMessageInsideRoomToAll(roomID, msg); err != nil {
		return err
	}
	return nil
}
