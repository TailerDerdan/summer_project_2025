package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/infrastructure"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

type GameHandler struct {
	gameService infrastructure.IGameService
	//roomService infrastructure.IRoomService
	wsService infrastructure.IWebSocketService
	upgrader  *websocket.Upgrader
}

func NewGameHandler(gs infrastructure.IGameService, ws infrastructure.IWebSocketService) *GameHandler {
	return &GameHandler{
		gameService: gs,
		//roomService: rs,
		wsService: ws,
		upgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

//
//func (gh *GameHandler) HandleGameConnection(w http.ResponseWriter, r *http.Request, gameID string) {
//	conn, err := gh.upgrader.Upgrade(w, r, nil)
//	if err != nil {
//		log.Printf("Game WS upgrade failed: %v", err)
//		return
//	}
//
//	game, exists := gh.activeGames[gameID]
//	if !exists {
//		conn.WriteJSON(map[string]string{"error": "Game not found"})
//		conn.Close()
//		return
//	}
//
//	var auth struct {
//		Type string            `json:"type"`
//		Data map[string]string `json:"data"`
//	}
//
//	if err := conn.ReadJSON(&auth); err != nil || auth.Type != "game_auth" {
//		conn.Close()
//		return
//	}
//
//	gh.mu.Lock()
//	game.Players[conn] = &models.PlayerInfo{
//		X:        internal.GeneratePosition(),
//		Y:        internal.GeneratePosition(),
//		PlayerID: auth.Data["userId"],
//		Nickname: auth.Data["nickname"],
//	}
//	game.Stats[auth.Data["userId"]] = &models.PlayerStats{}
//	gh.mu.Unlock()
//	fmt.Printf("Connect: %s + %s + len: %d\n", auth.Data["userId"], auth.Data["nickname"], len(game.Players))
//
//	players := make([]*models.PlayerInfo, 0, len(game.Players))
//	for _, player := range game.Players {
//		if player.PlayerID != auth.Data["userId"] {
//			fmt.Printf("MSG: %s + %s\n", player.PlayerID, auth.Data["userId"])
//			players = append(players, &PlayerInfo{
//				X:        player.X,
//				Y:        player.Y,
//				PlayerID: player.PlayerID,
//				Nickname: player.Nickname,
//			})
//		}
//	}
//
//	conn.WriteJSON(map[string]interface{}{
//		"type": "init_players",
//		"data": map[string]interface{}{
//			"players": players,
//		},
//	})
//
//	msg := map[string]interface{}{
//		"type": "join_player",
//		"data": map[string]interface{}{
//			"x":        game.Players[conn].X,
//			"y":        game.Players[conn].Y,
//			"userId":   auth.Data["userId"],
//			"nickname": auth.Data["nickname"],
//		},
//	}
//	gh.gameService.SendMessageInsideGame(conn, gameID, msg)
//
//	for {
//		var msg struct {
//			Type string                 `json:"type"`
//			Data map[string]interface{} `json:"data"`
//		}
//		if err := conn.ReadJSON(&msg); err != nil {
//			// fmt.Printf("%+v\n", msg)
//			// h.removePlayerFromGame(gameID, conn)
//			// conn.Close()
//			// return
//		}
//		fmt.Printf("%+v\n", msg)
//		switch msg.Type {
//		case "player_left":
//			gh.gameService.RemovePlayerFromGame(gameID, conn)
//		case "game_ended":
//			return
//		case "player_move":
//			var positionData struct {
//				X float64 `json:"x"`
//				Y float64 `json:"y"`
//			}
//			for otherConn, player := range game.Players {
//				if otherConn != conn {
//					otherConn.WriteJSON(map[string]interface{}{
//						"type": "player_move",
//						"data": map[string]interface{}{
//							"userId": player.PlayerID,
//							"x":      positionData.X,
//							"y":      positionData.Y,
//						},
//					})
//				}
//			}
//			break
//		case "player_kill":
//			killerID, ok1 := msg.Data["killerId"].(string)
//			victimID, ok2 := msg.Data["victimId"].(string)
//			if ok1 && ok2 {
//				gh.gameService.HandlePlayerKill(gameID, killerID, victimID)
//			}
//
//		case "player_death":
//			playerID, ok := msg.Data["playerId"].(string)
//			if ok {
//				gh.gameService.HandlePlayerDeath(gameID, playerID)
//			}
//		case "update_players":
//			break
//		//case "shoot":
//		//	var bullet BulletInfo
//		//	if err := mapstructure.Decode(msg.Data, &bullet); err != nil {
//		//		continue
//		//	}
//		//
//		//	bullet.BulletID = h.generateBulletID()
//		//
//		//	game.mu.Lock()
//		//	game.Bullets[bullet.BulletID] = &bullet
//		//	game.mu.Unlock()
//		//
//		//	h.sendMessageInsideGame(conn, gameID, map[string]interface{}{
//		//		"type": "bullet_created",
//		//		"data": bullet,
//		//	})
//
//		case "bullet_hit":
//			playerHitID, ok1 := msg.Data["playerId"].(string)
//			bulletID, ok2 := msg.Data["bulletId"].(string)
//
//			if ok1 && ok2 {
//				gh.gameService.SendMessageInsideGame(conn, gameID, map[string]interface{}{
//					"type": "player_hit",
//					"data": map[string]interface{}{
//						"playerId": playerHitID,
//						"bulletId": bulletID,
//						"damage":   10,
//					},
//				})
//
//				game.mu.Lock()
//				delete(game.Bullets, bulletID)
//				game.mu.Unlock()
//			}
//		}
//	}
//}

func (gh *GameHandler) HandleGameConnection2(w http.ResponseWriter, r *http.Request, gameID string) {
	fmt.Println("/-000-/")
	conn, err := gh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Game WS upgrade failed: %v", err)
		return
	}
	defer conn.Close()
	fmt.Println("/-111-/")
	player, err := gh.authenticatePlayer(conn)
	if err != nil {
		log.Printf("Game WS authenticate failed: %v", err)
		gh.sendError(conn, "Game WS authenticate failed")
		return
	}
	fmt.Println("/-222-/")
	if err := gh.gameService.RegisterPlayer(conn, gameID, player); err != nil {
		log.Printf("Game WS register failed: %v", err)
		gh.sendError(conn, "Game WS register failed")
		return
	}
	fmt.Println("/-333-/")
	if err := gh.sendInitialGameState(conn, gameID); err != nil {
		log.Printf("Game WS send initial game state failed: %v", err)
		gh.sendError(conn, "Game WS send initial game state failed")
		return
	}
	fmt.Println("/-444-/")
	if err := gh.gameService.StartTimer(gameID); err != nil {
		log.Printf("Game WS start timer failed: %v", err)
	}
	gh.handleGameMessage(conn, gameID, player.PlayerID)
}

func (gh *GameHandler) authenticatePlayer(conn *websocket.Conn) (*models.PlayerInfo, error) {
	var msg models.Msg
	fmt.Println("@-000-@")
	if err := conn.ReadJSON(&msg); err != nil {
		return nil, err
	}
	if msg.Type != "game_auth" {
		return nil, fmt.Errorf("not a game_auth")
	}
	fmt.Println("@-111-@")
	return &models.PlayerInfo{
		PlayerID: msg.Data["userId"].(string),
		Nickname: msg.Data["nickname"].(string),
		X:        internal.GeneratePosition(),
		Y:        internal.GeneratePosition(),
		Angle:    0,
	}, nil
}

func (gh *GameHandler) sendInitialGameState(conn *websocket.Conn, gameID string) error {
	players, err := gh.gameService.GetGameState(gameID)
	if err != nil {
		return err
	}
	return conn.WriteJSON(map[string]interface{}{
		"type": "init_players",
		"data": map[string]interface{}{
			"players": players,
		},
	})
}

func (gh *GameHandler) handleGameMessage(conn *websocket.Conn, gameID, playerID string) {
	defer gh.gameService.RemovePlayerFromGame(gameID, conn)
	for {
		var msg models.Msg
		_, messageBytes, err := conn.ReadMessage()
		if err != nil {
			log.Printf("G WebSocket read error: %v", err)
			//gh.gameService.RemovePlayerFromGame(gameID, conn)
			break
		}
		log.Printf("G Raw message: %s", string(messageBytes))
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Printf("G Failed to parse JSON: %v\nRaw data: %s", err, string(messageBytes))
			//gh.gameService.RemovePlayerFromGame(gameID, conn)
			break
		}
		fmt.Println("/-555-/")
		if err := gh.processGameMessage(conn, gameID, playerID, msg); err != nil {
			log.Printf("$$ Game WS process message failed: %v", err)
			break
		}
	}
}

func (gh *GameHandler) processGameMessage(conn *websocket.Conn, gameID, playerID string, msg models.Msg) error {
	switch msg.Type {
	case "player_join":
		fmt.Println("/-666-/")
		return nil
		//return gh.gameService.PLayerJoin(gameID, playerID, msgJoin.Data["x"], msgJoin.Data["y"], msgJoin.Data["angle"])
	case "update_position":
		fmt.Println("/-777-/")
		return nil
		//return gh.gameService.UpdatePosition(gameID, playerID, msgUpdatePos.Data["x"], msgUpdatePos.Data["Y"], msgUpdatePos.Data["angle"])
	}
	return nil
}

func (gh *GameHandler) sendError(conn *websocket.Conn, msg string) {
	conn.WriteJSON(map[string]string{"error": msg})
	conn.Close()
}
