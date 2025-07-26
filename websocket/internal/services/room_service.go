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
	rooms     map[string]*models.Room
	wsService infrastructure.IWebSocketService
	mu        sync.Mutex
}

func NewRoomService(wsService infrastructure.IWebSocketService) *RoomService {
	return &RoomService{
		rooms:     make(map[string]*models.Room),
		wsService: wsService,
	}
}

func (rs *RoomService) CreateRoom(msgCreateRoom models.MsgCreateRoom) (*models.Room, error) {
	if _, exists := rs.rooms[msgCreateRoom.RoomID]; exists {
		return nil, fmt.Errorf("Room already exists")
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

//func (rs *RoomService) UpdateReadyState(conn *websocket.Conn, roomID string) {
//	user := rs.rooms[roomID].Clients[conn]
//	user.IsReady = !user.IsReady
//}

//func (rs *RoomService) RegisterConnection(conn *websocket.Conn, roomID, userID, nickname string) {
//	if _, exists := rs.rooms[roomID]; !exists {
//		log.Printf("Attempt to join non-existent room: %s", roomID)
//		conn.WriteJSON(map[string]string{"error": "Room does not exist"})
//		conn.Close()
//		return
//	}
//
//	for existingConn, user := range rs.rooms[roomID].Clients {
//		if user.UserID == userID {
//			log.Printf("User %s already in room %s", userID, roomID)
//			existingConn.Close()
//			delete(rs.rooms[roomID].Clients, existingConn)
//			break
//		}
//	}
//
//	fmt.Printf("max players: %d\n", rs.rooms[roomID].MaxPlayers)
//	if rs.rooms[roomID].PlayersCount < rs.rooms[roomID].MaxPlayers {
//		fmt.Printf("add player %s to room %s\n", userID, roomID)
//		rs.rooms[roomID].PlayersCount++
//		rs.rooms[roomID].Clients[conn] = &models.UserInfo{
//			UserID:   userID,
//			Nickname: nickname,
//			IsReady:  false,
//		}
//		log.Printf("User %s joined room %s", nickname, roomID)
//	} else {
//		conn.WriteJSON(map[string]string{"error": "Room is full"})
//		conn.Close()
//	}
//}

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
		"type": "user_leaved_g",
		"data": map[string]interface{}{
			"roomId":   roomID,
			"userId":   clientInfo.UserID,
			"nickname": clientInfo.Nickname,
		},
	}

	rs.wsService.SendMessageGlobal(leaveMsg)
	leaveMsg["type"] = "user_leaved_l"
	err := rs.SendMessageInsideRoom(conn, roomID, leaveMsg)
	if err != nil {
		log.Println(err)
		return
	}

	if room.PlayersCount > 0 {
		room.PlayersCount--
	}
	conn.Close()
	delete(room.Clients, conn)

	if room.PlayersCount == 0 || room.HostID == userID {
		deleteRoomMsg := map[string]interface{}{
			"type": "delete_room_g",
			"data": map[string]string{
				"roomId": roomID,
			},
		}
		rs.wsService.SendMessageGlobal(deleteRoomMsg)
		deleteRoomMsg["type"] = "delete_room_l"
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

	if err := conn.Close(); err != nil {
		log.Printf("Error closing websocket connection: %v", err)
	}
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

	conn.WriteJSON(map[string]interface{}{
		"type":  "room_info",
		"users": users,
	})
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
				if err := conn.Close(); err != nil {
					return fmt.Errorf("error conn closing to client")
				}
				rs.mu.Lock()
				delete(room.Clients, conn)
				rs.mu.Unlock()
			}
		}
	}
	return nil
}

//func (rs *RoomService) CheckUsersReadyToStartGame(conn *websocket.Conn, roomID string) bool {
//	for _, user := range rs.rooms[roomID].Clients {
//		if !user.IsReady {
//			fmt.Println("Not all users ready to start game")
//			msg := map[string]interface{}{
//				"type": "not_all_ready",
//			}
//			conn.WriteJSON(msg)
//			return false
//		}
//	}
//	return true
//}
//
//func (rs *RoomService) CheckAuthToStartGame(conn *websocket.Conn, roomID string, userID string) bool {
//	room := rs.rooms[roomID]
//	if room == nil {
//		conn.WriteJSON(map[string]string{"error": "Room not found"})
//		conn.Close()
//		return false
//	}
//
//	if room.HostID != userID {
//		conn.WriteJSON(map[string]string{"error": "Start game can only HOST user"})
//		conn.Close()
//		return false
//	}
//	return true
//}

func (rs *RoomService) RegisterUser(conn *websocket.Conn, roomID string, user *models.UserInfo) error {
	rs.mu.Lock()
	defer rs.mu.Unlock()
	room, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("Room not found")
	}
	if room.PlayersCount >= room.MaxPlayers {
		return fmt.Errorf("Max players reached")
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
	rs.mu.Lock()
	defer rs.mu.Unlock()
	room, exists := rs.rooms[roomID]
	if !exists {
		return nil, fmt.Errorf("Room not found")
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

//	func (rs *RoomService) UserJoin() error {
//		return nil
//	}
func (rs *RoomService) UserLeave(conn *websocket.Conn, roomID, userID string) error {
	rs.mu.Lock()
	defer rs.mu.Unlock()
	_, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("Room not found")
	}
	rs.UnregisterConnection(conn, roomID, userID)
	return nil
}
func (rs *RoomService) UserReady(conn *websocket.Conn, roomID string) error {
	rs.mu.Lock()
	defer rs.mu.Unlock()
	room := rs.rooms[roomID]
	user := room.Clients[conn]
	user.IsReady = !user.IsReady

	msg := map[string]interface{}{
		"type": "update_ready_state",
		"data": map[string]interface{}{
			"isReady": user.IsReady,
			"userId":  user.UserID,
		},
	}
	if err := conn.WriteJSON(msg); err != nil {
		if err := conn.Close(); err != nil {
			return fmt.Errorf("error closing to client")
		}
	}
	return nil
}

//	func (rs *RoomService) DeleteRoom() error {
//		return nil
//	}
func (rs *RoomService) StartGame(roomID, userID string) error {
	rs.mu.Lock()
	defer rs.mu.Unlock()
	room, exists := rs.rooms[roomID]
	if !exists {
		return fmt.Errorf("Room not found")
	}
	if room.HostID != userID {
		return fmt.Errorf("Only HOST user can start game")
	}
	for _, client := range room.Clients {
		if !client.IsReady {
			return fmt.Errorf("Client not ready to start game")
		}
	}

	return nil
}
