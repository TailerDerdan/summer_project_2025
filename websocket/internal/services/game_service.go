package services

import (
	"crypto/rand"
	"sort"
	"time"

	//"errors"
	"fmt"
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	//"log"
	"math/big"
	//"sort"
	"sync"
)

type GameService struct {
	activeGames map[string]*models.Game
	mu          sync.Mutex
}

func NewGameService() *GameService {
	return &GameService{
		activeGames: make(map[string]*models.Game),
	}
}

//func (gs *GameService) StartGame(conn *websocket.Conn, roomID, userID, gameType string) {
//if ok := gs.roomService.CheckAuthToStartGame(conn, roomID, userID); !ok {
//	return
//}
//
//if ok := gs.roomService.CheckUsersReadyToStartGame(conn, roomID); !ok {
//	return
//}
//
//gameID := gs.generateGameID(gameType)
//
//players := make(map[string]*models.PlayerInfo)
//for _, user := range gs.rooms[roomID].Clients {
//	players[user.UserID] = &models.PlayerInfo{
//		PlayerID: user.UserID,
//		Nickname: user.Nickname,
//	}
//}
//
//startMsg := map[string]interface{}{
//	"type": "start_game",
//	"data": map[string]interface{}{
//		"userId":   userID,
//		"roomId":   roomID,
//		"gameId":   gameID,
//		"gameType": gameType,
//		"players":  players,
//	},
//}
//gs.roomService.SendMessageInsideRoomToAll(roomID, startMsg)
//
//game := &models.Game{
//	GameID:    gameID,
//	RoomID:    roomID,
//	Type:      gameType,
//	Players:   make(map[*websocket.Conn]*models.PlayerInfo),
//	Stats:     make(map[string]*models.PlayerStats),
//	StartTime: time.Now(),
//	Duration:  1 * time.Hour,
//}
//
//gs.activeGames[gameID] = game
//
//go func() {
//	ticker := time.NewTicker(1 * time.Second)
//	defer ticker.Stop()
//	fmt.Println("3333333")
//	for {
//		select {
//		case <-ticker.C:
//			elapsed := time.Since(game.StartTime)
//			remaining := game.Duration - elapsed
//			fmt.Println("4444444444")
//			if remaining <= 0 {
//				gs.EndGame(gameID)
//				return
//			}
//
//			msg := map[string]interface{}{
//				"type": "time_update",
//				"data": map[string]interface{}{
//					"remaining": int(remaining.Seconds()),
//				},
//			}
//
//			gs.SendMessageInsideGameToAll(gameID, msg)
//		}
//	}
//}()
//}

func (gs *GameService) CreateGame(roomID, gameType string) *models.Game {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	gameID := gs.generateGameID(gameType)
	game := &models.Game{
		GameID:    gameID,
		RoomID:    roomID,
		Type:      gameType,
		Players:   make(map[*websocket.Conn]*models.PlayerInfo),
		Stats:     make(map[string]*models.PlayerStats),
		StartTime: time.Now(),
		Duration:  2 * time.Minute,
	}

	gs.activeGames[gameID] = game
	return game
}

func (gs *GameService) SendMessageInsideGame(playerConn *websocket.Conn, gameID string, msg map[string]interface{}) error {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game not exists")
	}
	for conn := range game.Players {
		if conn != playerConn {
			if err := conn.WriteJSON(msg); err != nil {
				if err := conn.Close(); err != nil {
					return fmt.Errorf("error conn closing to client")
				}
				gs.mu.Lock()
				delete(game.Players, conn)
				gs.mu.Unlock()
				return err
			}
		}
	}
	return nil
}

func (gs *GameService) SendMessageInsideGameToAll(gameID string, msg map[string]interface{}) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game not exists")
	}
	fmt.Printf("Sending message to all players: %v\n", msg)
	for conn := range game.Players {
		fmt.Printf("qwerty, msg: %v\n", msg)
		if err := conn.WriteJSON(msg); err != nil {
			fmt.Printf("asdfg\n")
			if err := conn.Close(); err != nil {
				return fmt.Errorf("error conn closing to client")
			}
			gs.mu.Lock()
			delete(game.Players, conn)
			gs.mu.Unlock()
			return err
		}
	}
	fmt.Println("End sending message to all players")
	return nil
}

func (gs *GameService) CheckGameEndConditions(gameID string) {
	//game, exists := gs.activeGames[gameID]
	//if !exists {
	//	return
	//}
	//
	//game.mu.RLock()
	//defer game.mu.RUnlock()
	//
	//alivePlayers := make([]string, 0)
	//for _, player := range game.Players {
	//	isAlive := true
	//	for _, death := range game.Deaths {
	//		if death.PlayerID == player.PlayerID {
	//			isAlive = false
	//			break
	//		}
	//	}
	//	if isAlive {
	//		alivePlayers = append(alivePlayers, player.PlayerID)
	//	}
	//}
	//
	//if len(alivePlayers) <= 1 {
	//	winner := ""
	//	if len(alivePlayers) == 1 {
	//		winner = alivePlayers[0]
	//	}
	//
	//	endMsg := map[string]interface{}{
	//		"type": "game_end",
	//		"data": map[string]interface{}{
	//			"winner": winner,
	//			"deaths": game.Deaths,
	//			"gameId": gameID,
	//		},
	//	}
	//	fmt.Printf("Game End: %s\n", endMsg)
	//	for conn := range game.Players {
	//		if err := conn.WriteJSON(endMsg); err != nil {
	//			log.Printf("Error sending game end message: %v", err)
	//		}
	//		conn.Close()
	//	}
	//
	//	gs.mu.Lock()
	//	delete(gs.activeGames, gameID)
	//	gs.mu.Unlock()
	//}
}
func (gs *GameService) RemovePlayerFromGame(gameID string, conn *websocket.Conn) {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return
	}
	player, ok := game.Players[conn]
	if !ok {
		return
	}

	leaveMsg := map[string]interface{}{
		"type": "player_left_server",
		"data": map[string]string{
			"playerId": player.PlayerID,
		},
	}
	if err := gs.SendMessageInsideGame(conn, gameID, leaveMsg); err != nil {
		fmt.Println("error sending leave message")
		return
	}
	conn.Close()
	delete(game.Players, conn)
}

func (gs *GameService) generateGameID(gameType string) string {
	const charset = "ABCDEFGHJIKLMNPOQRSTUVWXYZ0123456789"
	idPart := make([]byte, 9)

	for i := range idPart {
		if i == 4 {
			idPart[i] = '-'
			continue
		}
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		idPart[i] = charset[num.Int64()]
	}

	return fmt.Sprintf("%s-%s", gameType, string(idPart))
}

func (gs *GameService) EndGame(gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	winnerID := gs.determineWinner(gameID)
	game.State.Winner = winnerID
	players := make([]models.PlayerInfo, 0, len(game.Players))
	for _, player := range game.Players {
		players = append(players, models.PlayerInfo{
			PlayerID: player.PlayerID,
			Nickname: player.Nickname,
		})
	}
	endMsg := map[string]interface{}{
		"type": "game_end_server",
		"data": map[string]interface{}{
			"gameId":  gameID,
			"winner":  winnerID,
			"stats":   game.Stats,
			"players": players,
		},
	}
	if err := gs.SendMessageInsideGameToAll(gameID, endMsg); err != nil {
		fmt.Println("error sending end message")
		return err
	}
	for conn := range game.Players {
		if err := conn.Close(); err != nil {
			fmt.Println("error closing to client")
			return err
		}
		gs.mu.Lock()
		delete(game.Players, conn)
		gs.mu.Unlock()
	}
	gs.mu.Lock()
	delete(gs.activeGames, gameID)
	gs.mu.Unlock()
	return nil
}

func (gs *GameService) determineWinner(gameID string) string {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return ""
	}

	var winnerID string
	var maxScore = -1

	for id, stats := range game.Stats {
		if stats.Score > maxScore {
			maxScore = stats.Score
			winnerID = id
		}
	}

	if maxScore <= 0 {
		if len(game.Players) > 0 {
			for conn := range game.Players {
				winnerID = game.Players[conn].PlayerID
				break
			}
		}
	}
	return winnerID
}

func (gs *GameService) sendGameStatsUpdate(gameID string) error {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	type playerScore struct {
		ID    string
		Score int
	}

	var rankings []playerScore
	for playerId, stats := range game.Stats {
		rankings = append(rankings, playerScore{ID: playerId, Score: stats.Score})
	}

	sort.Slice(rankings, func(i, j int) bool {
		return rankings[i].Score > rankings[j].Score
	})

	for i, rank := range rankings {
		game.Stats[rank.ID].Position = i + 1
	}

	msg := map[string]interface{}{
		"type": "stats_update_server",
		"data": map[string]interface{}{
			"stats":       game.Stats,
			"gameId":      gameID,
			"leaderboard": rankings,
		},
	}

	if err := gs.SendMessageInsideGameToAll(gameID, msg); err != nil {
		fmt.Println("error sending stats message")
		return err
	}
	return nil
}

func (gs *GameService) PlayerKill(gameID, playerID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	if stats, ok := game.Stats[playerID]; ok {
		stats.Kills++
		stats.Score += 100
	}

	if err := gs.SendGameStatsUpdate(gameID); err != nil {
		fmt.Println("error sending stats message")
		return err
	}
	return nil
}

func (gs *GameService) PlayerDeath(gameID, playerID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	if stats, ok := game.Stats[playerID]; ok {
		stats.Deaths++
	}

	if err := gs.SendGameStatsUpdate(gameID); err != nil {
		fmt.Println("error sending stats message")
		return err
	}
	return nil
}

//func (gs *GameService) CreateGame(gameID, roomID, gameType string, duration time.Duration) *models.Game {
//	return &models.Game{
//		GameID:   gs.generateGameID(gameID),
//		RoomID:   roomID,
//		Type:     gameType,
//		Duration: duration,
//	}
//}

func (gs *GameService) RegisterPlayer(conn *websocket.Conn, gameID string, player *models.PlayerInfo) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	game.Players[conn] = player
	game.Stats[player.PlayerID] = &models.PlayerStats{}
	joinMsg := map[string]interface{}{
		"type": "join_player_server",
		"data": map[string]interface{}{
			"userId": player.PlayerID,
			"x":      player.X,
			"y":      player.Y,
			"dir":    player.Dir,
		},
	}
	if err := gs.SendMessageInsideGame(conn, gameID, joinMsg); err != nil {
		fmt.Println("error sending join message")
		return err
	}
	return nil
}

func (gs *GameService) GetGameState(gameID string) ([]models.PlayerInfo, error) {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return nil, fmt.Errorf("game %s does not exist", gameID)
	}

	players := make([]models.PlayerInfo, 0, len(game.Players))

	for _, player := range game.Players {
		players = append(players, models.PlayerInfo{
			PlayerID: player.PlayerID,
			Nickname: player.Nickname,
			X:        player.X,
			Y:        player.Y,
			Dir:      player.Dir,
		})
	}

	return players, nil
}

func (gs *GameService) StartTimer(gameID string) {
	gs.mu.Lock()
	game, exists := gs.activeGames[gameID]
	gs.mu.Unlock()

	if !exists {
		return //fmt.Errorf("game %s does not exist", gameID)
	}

	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				elapsed := time.Since(game.StartTime)
				remaining := game.Duration - elapsed
				if remaining <= 0 {
					if err := gs.EndGame(gameID); err != nil {
						fmt.Printf("error sending end message: %v\n", err)
						return
					}
					return
				}

				msg := map[string]interface{}{
					"type": "time_update_server",
					"data": map[string]interface{}{
						"remaining": int(remaining.Seconds()),
					},
				}
				if err := gs.SendMessageInsideGameToAll(gameID, msg); err != nil {
					fmt.Printf("error sending time message: %v\n", err)
					return
				}
			}
		}
	}()
}

func (gs *GameService) UpdatePosition(conn *websocket.Conn, gameID, playerID string, x, y interface{}) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	player := game.Players[conn]
	player.X = x.(float64)
	player.Y = y.(float64)

	positionMsg := map[string]interface{}{
		"type": "player_move_server",
		"data": map[string]interface{}{
			"userId": playerID,
			"x":      player.X,
			"y":      player.Y,
			"dir":    player.Dir,
		},
	}

	if err := gs.SendMessageInsideGame(conn, gameID, positionMsg); err != nil {
		fmt.Println("error sending position message")
		return err
	}
	return nil
}

func (gs *GameService) UpdateBullets(conn *websocket.Conn, gameID string, data map[string]interface{}) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	_, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	bulletsMsg := map[string]interface{}{
		"type": "update_bullets_server",
		"data": data,
	}

	if err := gs.SendMessageInsideGame(conn, gameID, bulletsMsg); err != nil {
		fmt.Println("error sending bullets message")
		return err
	}
	return nil
}

func (gs *GameService) SendInitialGameState(conn *websocket.Conn, gameID string) error {
	players, err := gs.GetGameState(gameID)
	if err != nil {
		return err
	}
	return conn.WriteJSON(map[string]interface{}{
		"type": "init_players_server",
		"data": map[string]interface{}{
			"players": players,
		},
	})
}
