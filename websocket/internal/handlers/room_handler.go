package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/infrastructure"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

type RoomHandler struct {
	roomService infrastructure.IRoomService
	gameService infrastructure.IGameService
	wsService   infrastructure.IWebSocketService
	upgrader    *websocket.Upgrader
}

func NewRoomHandler(rs infrastructure.IRoomService, gs infrastructure.IGameService, ws infrastructure.IWebSocketService) *RoomHandler {
	return &RoomHandler{
		roomService: rs,
		gameService: gs,
		wsService:   ws,
		upgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

//func (rh *RoomHandler) HandleConnectionInRoom(w http.ResponseWriter, r *http.Request, roomID string) {
//	conn, err := rh.upgrader.Upgrade(w, r, nil)
//	if err != nil {
//		log.Printf("WebSocket upgrade failed: %v", err)
//		return
//	}
//
//	var authMsg struct {
//		Type string            `json:"type"`
//		Data map[string]string `json:"data"`
//	}
//
//	if err := conn.ReadJSON(&authMsg); err != nil || authMsg.Type != "auth" {
//		conn.WriteJSON(map[string]string{"error": "Authentication required"})
//		conn.Close()
//		return
//	}
//
//	userID := authMsg.Data["userId"]
//	nickname := authMsg.Data["nickname"]
//
//	if roomID == "" || userID == "" {
//		http.Error(w, "room_id and user_id are required", http.StatusBadRequest)
//		return
//	}
//	if _, exists := rh.rooms[roomID]; !exists {
//		conn.WriteJSON(map[string]string{"error": "Room does not exist"})
//		return
//	}
//	fmt.Printf("Room %s user %s\n", roomID, userID)
//	rh.roomService.RegisterConnection(conn, roomID, userID, nickname)
//
//	msg := map[string]interface{}{
//		"type": "user_joined",
//		"data": map[string]string{
//			"userId":   userID,
//			"nickname": nickname,
//		},
//	}
//	rh.roomService.SendMessageInsideRoom(conn, roomID, msg)
//	rh.roomService.SendRoomInfo(conn, roomID)
//
//	msg = map[string]interface{}{
//		"type": "add_user",
//		"data": map[string]string{
//			"roomId":   roomID,
//			"userId":   userID,
//			"nickname": nickname,
//		},
//	}
//	rh.wsService.SendMessageGlobal(msg)
//
//	for {
//		var msg struct {
//			Type string            `json:"type"`
//			Data map[string]string `json:"data"`
//		}
//
//		if err := conn.ReadJSON(&msg); err != nil {
//			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
//				log.Printf("WebSocket error: %v", err)
//			}
//			break
//		}
//
//		switch msg.Type {
//		case "leave_room":
//			log.Printf("User %s requested to leave room %s", msg.Data["userId"], roomID)
//			msgResponse := map[string]interface{}{
//				"type": "leave_ack",
//				"data": map[string]string{
//					"roomId":   roomID,
//					"userId":   msg.Data["userId"],
//					"nickname": msg.Data["nickname"],
//				},
//			}
//			if err := conn.WriteJSON(msgResponse); err != nil {
//				log.Printf("WebSocket error: %v", err)
//			}
//			rh.roomService.UnregisterConnection(conn, roomID, userID)
//		case "start_game":
//			log.Printf("Attempt to start game from user: %s", userID)
//			rh.gameService.StartGame(conn, roomID, msg.Data["userId"], msg.Data["gameType"])
//			msg := map[string]interface{}{
//				"type": "delete_room_g",
//				"data": map[string]string{
//					"roomId": roomID,
//				},
//			}
//			rh.wsService.SendMessageGlobal(msg)
//			rh.roomService.SendMessageInsideRoomToAll(roomID, msg)
//			//h.unregisterConnection(conn, roomID, userID)
//		case "ready_state":
//			rh.roomService.UpdateReadyState(conn, roomID)
//			msg := map[string]interface{}{
//				"type": "update_ready_state",
//				"data": map[string]interface{}{
//					"isReady": rh.rooms[roomID].Clients[conn].IsReady,
//					"userId":  userID,
//				},
//			}
//			rh.roomService.SendMessageInsideRoomToAll(roomID, msg)
//		}
//	}
//}

func (rh *RoomHandler) HandleCreateRoom(w http.ResponseWriter, r *http.Request) {
	fmt.Println("000")
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Println("111")
	var msgCreateRoom models.MsgCreateRoom
	if err := json.NewDecoder(r.Body).Decode(&msgCreateRoom); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	fmt.Println("222")
	room, err := rh.roomService.CreateRoom(msgCreateRoom)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	fmt.Println("333")
	msg := map[string]interface{}{
		"type": "room_create",
		"room": map[string]interface{}{
			"roomId":       room.RoomID,
			"name":         room.Name,
			"gamemode":     room.Gamemode,
			"isOpen":       room.IsOpen,
			"userId":       room.HostID,
			"maxPlayers":   room.MaxPlayers,
			"playersCount": room.PlayersCount,
		},
		"user": map[string]interface{}{
			"roomId":   room.RoomID,
			"userId":   msgCreateRoom.HostID,
			"nickname": msgCreateRoom.Nickname,
		},
	}
	fmt.Println("444")
	if err := rh.wsService.SendMessageGlobal(msg); err != nil {
		log.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	fmt.Println("555")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	resp := map[string]interface{}{
		"roomId": msgCreateRoom.RoomID,
	}
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Printf("WebSocket error: %v", err)
	}
	fmt.Println("666")
}

func (rh *RoomHandler) HandleRoomConnection(w http.ResponseWriter, r *http.Request, roomID string) {
	fmt.Println("777")
	conn, err := rh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket error: %v", err)
		return
	}
	defer conn.Close()
	fmt.Println("888")
	user, err := rh.authenticateUser(conn)
	if err != nil {
		log.Printf("Failed to authenticate user: %v", err)
		rh.sendError(conn, "Failed to authenticate user")
		return
	}
	fmt.Println("999")
	if err := rh.roomService.RegisterUser(conn, roomID, user); err != nil {
		log.Printf("Failed to register user: %v", err)
		rh.sendError(conn, "Failed to register user")
		return
	}
	fmt.Println("#-000-#")
	if err := rh.sendInitialRoomState(conn, roomID); err != nil {
		log.Printf("Failed to send initial room state: %v", err)
		rh.sendError(conn, "Failed to send initial room state")
		return
	}
	fmt.Println("#-111-#")
	if err := rh.sendJoinRoom(conn, roomID, user); err != nil {
		log.Printf("Failed to send join room: %v", err)
		rh.sendError(conn, "Failed to send join room")
		return
	}
	fmt.Println("#-222-#")
	rh.handleRoomMessage(conn, roomID, user.UserID)
	fmt.Println("#-333-#")
}

func (rh *RoomHandler) sendJoinRoom(conn *websocket.Conn, roomID string, user *models.UserInfo) error {
	fmt.Println("#-444-#")
	msg := map[string]interface{}{
		"type": "user_joined",
		"data": map[string]string{
			"userId":   user.UserID,
			"nickname": user.Nickname,
		},
	}
	fmt.Println("#-555-#")
	err := rh.roomService.SendMessageInsideRoom(conn, roomID, msg)
	if err != nil {
		return err
	}
	fmt.Println("#-666-#")
	msg = map[string]interface{}{
		"type": "add_user",
		"data": map[string]string{
			"roomId":   roomID,
			"userId":   user.UserID,
			"nickname": user.Nickname,
		},
	}
	fmt.Println("#-777-#")
	if err := rh.wsService.SendMessageGlobal(msg); err != nil {
		return err
	}
	return nil
}

func (rh *RoomHandler) authenticateUser(conn *websocket.Conn) (*models.UserInfo, error) {
	fmt.Println("#-888-#")
	var msg models.Msg
	if err := conn.ReadJSON(&msg); err != nil {
		return nil, err
	}
	fmt.Printf("%v\n", msg)
	if msg.Type != "user_auth" {
		fmt.Printf("Msg-Type: %s\n", msg.Type)
		return nil, errors.New("invalid user type")
	}
	fmt.Println("#-999-#")
	return &models.UserInfo{
		IsReady:  false,
		UserID:   msg.Data["userId"].(string),
		Nickname: msg.Data["nickname"].(string),
	}, nil
}

func (rh *RoomHandler) sendInitialRoomState(conn *websocket.Conn, roomID string) error {
	users, err := rh.roomService.GetRoomState(roomID)
	if err != nil {
		return err
	}
	fmt.Println("$-000-$")
	return conn.WriteJSON(map[string]interface{}{
		"type": "init_users",
		"data": map[string]interface{}{
			"users": users,
		},
	})
}

func (rh *RoomHandler) handleRoomMessage(conn *websocket.Conn, roomID, userID string) {
	fmt.Println("$-111-$")
	for {
		var msg models.Msg
		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("Error json parse: %v", err)
			break
		}
		if err := rh.processRoomMessage(conn, roomID, userID, msg); err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}
	}
	rh.roomService.UnregisterConnection(conn, roomID, userID)
}

func (rh *RoomHandler) processRoomMessage(conn *websocket.Conn, roomID, userID string, msg models.Msg) error {
	fmt.Println("$-222-$")
	switch msg.Type {
	//case "user_join":
	//	err := rh.roomService.UserJoin()
	//	return err
	case "user_leave":
		fmt.Println("$-333-$")
		err := rh.roomService.UserLeave(conn, roomID, userID)
		return err
	case "user_ready":
		fmt.Println("$-444-$")
		err := rh.roomService.UserReady(conn, roomID)
		return err
	//case "delete_room":
	//	err := rh.roomService.DeleteRoom()
	//	return err
	case "start_game":
		fmt.Println("$-555-$")
		gameType, _ := msg.Data["gameType"].(string)
		err := rh.roomService.StartGame(conn, roomID, userID, gameType)
		return err
	}
	return nil
}

func (rh *RoomHandler) sendError(conn *websocket.Conn, msg string) {
	conn.WriteJSON(map[string]string{"error": msg})
	conn.Close()
}
