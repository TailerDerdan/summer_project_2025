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
	wsService   infrastructure.IWebSocketService
	upgrader    *websocket.Upgrader
}

func NewGameHandler(gs infrastructure.IGameService, ws infrastructure.IWebSocketService) *GameHandler {
	return &GameHandler{
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

func (gh *GameHandler) HandleGameConnection(w http.ResponseWriter, r *http.Request, gameID string) {
	conn, err := gh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Game WS upgrade failed: %v", err)
		return
	}
	//defer conn.Close()

	player, err := gh.authenticatePlayer(conn)
	if err != nil {
		log.Printf("Game WS authenticate failed: %v", err)
		gh.sendError(conn, "Game WS authenticate failed")
		return
	}

	if err := gh.gameService.RegisterPlayer(conn, gameID, player); err != nil {
		log.Printf("Game WS register failed: %v", err)
		gh.sendError(conn, "Game WS register failed")
		return
	}

	go gh.gameService.StartWaitingPlayers(gameID)

	if err := gh.gameService.SendInitialGameState(conn, gameID); err != nil {
		log.Printf("Game WS send initial game state failed: %v", err)
		gh.sendError(conn, "Game WS send initial game state failed")
		return
	}

	gh.handleGameMessage(conn, gameID, player.PlayerID)
}

func (gh *GameHandler) authenticatePlayer(conn *websocket.Conn) (*models.PlayerInfo, error) {
	var msg models.Msg

	if err := conn.ReadJSON(&msg); err != nil {
		return nil, err
	}
	if msg.Type != "game_auth" {
		return nil, fmt.Errorf("not a game_auth")
	}

	return &models.PlayerInfo{
		PlayerID: msg.Data["userId"].(string),
		Nickname: msg.Data["nickname"].(string),
		X:        internal.GeneratePosition(),
		Y:        internal.GeneratePosition(),
		Dir:      0,
	}, nil
}

func (gh *GameHandler) handleGameMessage(conn *websocket.Conn, gameID, playerID string) {
	//defer gh.gameService.RemovePlayerFromGame(gameID, conn)
	for {
		var msg models.Msg
		//if err := conn.ReadJSON(&msg); err != nil {
		//	log.Printf("Game WS read message failed: %v", err)
		//}
		_, messageBytes, err := conn.ReadMessage()
		log.Printf("G Received: %s", string(messageBytes))
		if err != nil {
			log.Printf("G WebSocket read error: %v", err)
			//gh.gameService.RemovePlayerFromGame(gameID, conn)
			break
		}
		log.Printf("G raw message: %s", string(messageBytes))
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Printf("G Failed to parse JSON: %v\nRaw data: %s", err, string(messageBytes))
			//gh.gameService.RemovePlayerFromGame(gameID, conn)
			break
		}

		//gh.processGameMessage(conn, gameID, playerID, msg)
		if err := gh.processGameMessage(conn, gameID, playerID, msg); err != nil {
			log.Printf("$$ Game WS process message failed: %v", err)
			break
		}
	}
	gh.gameService.RemovePlayerFromGame(gameID, conn)
}

func (gh *GameHandler) processGameMessage(conn *websocket.Conn, gameID, playerID string, msg models.Msg) error {
	gameState, err := gh.gameService.GetGameState(gameID)
	if err != nil {
		return err
	}
	if gameState.Status != "playing" {
		allowedTypes := map[string]bool{
			"ready_to_battle": true,
			"weapons_points":  true,
			"player_move":     true,
		}

		if !allowedTypes[msg.Type] {
			return nil
		}
	}
	switch msg.Type {
	//case "player_join":
	//	fmt.Println("/-666-/")
	//	return nil
	//return gh.gameService.PLayerJoin(gameID, playerID, msgJoin.Data["x"], msgJoin.Data["y"], msgJoin.Data["angle"])
	case "player_move":
		//fmt.Println("/-777777-/")
		//gh.gameService.EndGame(gameID)
		//return nil
		err := gh.gameService.UpdatePosition(conn, gameID, playerID, msg.Data)
		return err
	case "game_end":
		//fmt.Println("/-876786986-/")
		return nil
	case "update_bullets":
		//fmt.Println("/-00000_99999_0000-/")
		err := gh.gameService.UpdateBullets(conn, gameID, msg.Data)
		return err
	case "player_kill":
		//fmt.Println("player kill")
		err := gh.gameService.PlayerKill(gameID, playerID)
		return err
	case "player_death":
		//fmt.Println("player_death")
		err := gh.gameService.PlayerDeath(gameID, playerID)
		return err
	case "weapons_points":
		fmt.Println("12341234")
		err := gh.gameService.SetWeaponsPoints(gameID, msg.Data)
		return err
	case "change_weapon":
		err := gh.gameService.ChangeWeapon(conn, gameID, msg.Data)
		return err
	case "drop_weapon":
		err := gh.gameService.DropWeapon(conn, gameID)
		return err
	case "ready_to_battle":
		err := gh.gameService.ReadyToBattle(conn, gameID)
		return err
	}
	return nil
}

func (gh *GameHandler) sendError(conn *websocket.Conn, msg string) {
	conn.WriteJSON(map[string]string{"error": msg})
	conn.Close()
}
