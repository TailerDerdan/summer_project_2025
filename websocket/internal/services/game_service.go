package services

import (
	"crypto/rand"
	rand2 "math/rand"
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

const maxWeaponsOnMap = 10

func (gs *GameService) CreateGame(roomID string, data map[string]interface{}) *models.Game {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()
	gameType := data["gameType"].(string)
	gameID := gs.generateGameID(gameType)
	game := &models.Game{
		GameID:            gameID,
		RoomID:            roomID,
		Type:              gameType,
		Players:           make(map[*websocket.Conn]*models.PlayerInfo),
		Stats:             make(map[string]*models.PlayerStats),
		Weapons:           make(map[string]*models.Weapon),
		WeaponSpawnPoints: make([]models.SpawnPoint, 0),
		StartTime:         time.Now(),
		Duration:          30 * time.Second,
		State: models.GameState{
			CountDown: 15,
			Status:    "waiting",
		},
		ReadyCheck: make(map[string]bool),
	}
	gs.activeGames[gameID] = game
	gs.StartTimer(gameID)
	//go gs.waitingPlayers(gameID)
	//go gs.StartWaitingPlayers(gameID)
	return game
}

func (gs *GameService) StartWaitingPlayers(gameID string) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	timeout := time.After(1 * time.Minute)
	fmt.Println("666 666 666")
	for {
		select {
		case <-ticker.C:
			gs.mu.Lock()
			game, exists := gs.activeGames[gameID]
			if !exists {
				gs.mu.Unlock()
				return
			}
			fmt.Println("111 111 111")
			allConnected := true
			for _, player := range game.Players {
				if !game.ReadyCheck[player.PlayerID] {
					allConnected = false
					break
				}
			}
			fmt.Println("222 222 222")

			if allConnected {
				game.State.Status = "countdown"
				game.State.CountDown = 10
				gs.notifyGameState(gameID)
				gs.mu.Unlock()
				fmt.Println("rrr rrr www")
				go gs.startCountDown(gameID)
				return
			}
			fmt.Println("333 333 333")
			elapsed := time.Since(game.StartTime)
			remainingWait := 1*time.Minute - elapsed
			if remainingWait < 0 {
				remainingWait = 0
			}

			fmt.Println("444 444 444")
			msg := map[string]interface{}{
				"type": "waiting_update_server",
				"data": map[string]interface{}{
					"remaining": int(remainingWait.Seconds()),
					"connected": len(game.Players),
					"waiting":   true,
				},
			}
			fmt.Println("555 555 555")
			gs.SendMessageInsideGameToAll(gameID, msg)
			gs.mu.Unlock()

		case <-timeout:
			//gs.mu.Lock()
			game, exists := gs.activeGames[gameID]
			if !exists {
				//gs.mu.Unlock()
				return
			}
			fmt.Println("000 000 000")
			game.State.Status = "countdown"
			game.State.CountDown = 10
			gs.notifyGameState(gameID)
			//gs.mu.Unlock()
			fmt.Println("000 000 000")
			go gs.startCountDown(gameID)
			return
		}
	}
}

func (gs *GameService) startCountDown(gameID string) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		gs.mu.Lock()
		game, exists := gs.activeGames[gameID]
		if !exists {
			gs.mu.Unlock()
			return
		}

		game.State.CountDown--

		gs.notifyGameState(gameID)
		fmt.Println("999 000 999")
		if game.State.CountDown <= 0 {
			game.State.Status = "playing"
			game.StartTime = time.Now()
			gs.notifyGameState(gameID)
			fmt.Println("@@@ @@@ @@@")
			go gs.StartTimer(gameID)
			gs.mu.Unlock()
			return
		}
		gs.mu.Unlock()
	}
}

func (gs *GameService) notifyGameState(gameID string) {
	game, exists := gs.activeGames[gameID]
	if !exists {
		fmt.Println("Error notifyGameState")
		return
	}
	msg := map[string]interface{}{
		"type": "game_state_update_server",
		"data": map[string]interface{}{
			"status":    game.State.Status,
			"countdown": game.State.CountDown,
		},
	}
	if err := gs.SendMessageInsideGameToAll(gameID, msg); err != nil {
		fmt.Printf("Errrrrrror %v", err)
	}
}

func (gs *GameService) SendMessageInsideGame(playerConn *websocket.Conn, gameID string, msg map[string]interface{}) error {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game not exists")
	}
	fmt.Printf("%v, %v\n", game.Players, game.State.Status)
	for conn := range game.Players {
		fmt.Println("!!!!!!")
		if conn != playerConn {
			fmt.Printf("######, %v\n", msg)
			if err := conn.WriteJSON(msg); err != nil {
				fmt.Println("PPPPP")
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

func (gs *GameService) endGame(gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

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
			"winner":  game.State.Winner,
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
		fmt.Println("Error DetermineWinner, game does not exist")
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
				fmt.Printf("%v: %v\n", game.Players[conn], winnerID)
				winnerID = game.Players[conn].PlayerID
				break
			}
		}
	}
	fmt.Println("DetermineWinner, winnerID:", winnerID)
	return winnerID
}

func (gs *GameService) sendGameStatsUpdate(gameID string) error {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	type playerScore struct {
		ID    string `json:"id"`
		Score int    `json:"score"`
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

	if err := gs.sendGameStatsUpdate(gameID); err != nil {
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

	if err := gs.sendGameStatsUpdate(gameID); err != nil {
		fmt.Println("error sending stats message")
		return err
	}

	return nil
}

func (gs *GameService) RegisterPlayer(conn *websocket.Conn, gameID string, player *models.PlayerInfo) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()
	fmt.Println("5555")
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	fmt.Printf("7777, %v, %v\n", player, game)
	game.Players[conn] = player
	game.Stats[player.PlayerID] = &models.PlayerStats{}
	game.ReadyCheck[player.PlayerID] = true
	fmt.Println("8888")
	stateMsg := map[string]interface{}{
		"type": "game_state_server",
		"data": map[string]interface{}{
			"status":    "waiting",
			"countdown": game.State.CountDown,
		},
	}

	if err := conn.WriteJSON(stateMsg); err != nil {
		fmt.Println("error sending state message")
		return err
	}

	fmt.Println("######")
	return nil
}

func (gs *GameService) SendJoinRoom(conn *websocket.Conn, gameID string, player *models.PlayerInfo) error {
	fmt.Println("99999")
	joinMsg := map[string]interface{}{
		"type": "join_player_server",
		"data": map[string]interface{}{
			"userId":   player.PlayerID,
			"x":        player.X,
			"y":        player.Y,
			"dir":      player.Dir,
			"nickname": player.Nickname,
		},
	}
	fmt.Println("452345234")
	if err := gs.SendMessageInsideGame(conn, gameID, joinMsg); err != nil {
		fmt.Println("error sending join message")
		return err
	}
	return nil
}

func (gs *GameService) getGameState(gameID string) ([]models.PlayerInfo, []models.Weapon, error) {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()
	fmt.Println("rrqwer")
	game, exists := gs.activeGames[gameID]
	if !exists {
		fmt.Printf("game %s does not exist", gameID)
		return nil, nil, fmt.Errorf("game %s does not exist", gameID)
	}
	fmt.Println("uuuuuu")
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
	fmt.Println("jjjjj")
	weapons := make([]models.Weapon, 0, len(game.Weapons))
	for _, weapon := range game.Weapons {
		weapons = append(weapons, models.Weapon{
			ID:   weapon.ID,
			Type: weapon.Type,
			X:    weapon.X,
			Y:    weapon.Y,
			Ammo: weapon.Ammo,
		})
	}
	fmt.Printf("mdsfqew, %+v, %+v\n", players, weapons)
	return players, weapons, nil
}

func (gs *GameService) StartTimer(gameID string) {
	//gs.mu.Lock()
	game, exists := gs.activeGames[gameID]
	//gs.mu.Unlock()

	game.StartTime = time.Now()

	if !exists {
		return //fmt.Errorf("game %s does not exist", gameID)
	}

	go func() {
		ticker := time.NewTicker(1 * time.Second)
		weaponTicker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		defer weaponTicker.Stop()
		fmt.Println("aaa aaa aaa")
		for {
			select {
			case <-ticker.C:
				elapsed := time.Since(game.StartTime)
				remaining := game.Duration - elapsed
				if remaining <= 0 {
					if err := gs.saveGameStats(gameID); err != nil {
						fmt.Printf("123 error saving stats message: %v\n", err)
						return
					}
					if err := gs.endGame(gameID); err != nil {
						fmt.Printf("123 error sending end message: %v\n", err)
						return
					}
					fmt.Println("bbb bbb bbb")
					return
				}
				fmt.Println("ddd ddd ddd")
				msg := map[string]interface{}{
					"type": "time_update_server",
					"data": map[string]interface{}{
						"remaining": int(remaining.Seconds()),
					},
				}
				if err := gs.SendMessageInsideGameToAll(gameID, msg); err != nil {
					fmt.Printf("123 error sending time message: %v\n", err)
					return
				}
			case <-weaponTicker.C:
				fmt.Println("ggg ggg ggg")
				if err := gs.generateWeapons(gameID); err != nil {
					fmt.Printf("error generate weapons: %v\n", err)
					return
				}
			}
		}
	}()
}

func (gs *GameService) UpdatePosition(conn *websocket.Conn, gameID, playerID string, data map[string]interface{}) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	if game.State.Status != "playing" {
		return nil
	}

	player := game.Players[conn]
	player.X = data["x"].(float64)
	player.Y = data["y"].(float64)
	player.Dir = data["dir"].(float64)

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

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	if game.State.Status != "playing" {
		return nil
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
	conn.SetWriteDeadline(time.Now().Add(3 * time.Second))
	defer conn.SetWriteDeadline(time.Time{})

	players, weapons, err := gs.getGameState(gameID)
	if err != nil {
		fmt.Printf("error sending initial game state: %v\n", err)
		return err
	}
	msg := map[string]interface{}{
		"type": "init_players_server",
		"data": map[string]interface{}{
			"players": players,
			"weapons": weapons,
		},
	}
	fmt.Printf("666666, msg: %+v\n", msg)
	if err := conn.WriteJSON(msg); err != nil {
		return fmt.Errorf("send initial players message failed: %v", err)
	}
	return nil
}

func (gs *GameService) saveGameStats(gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	winnerID := gs.determineWinner(gameID)
	game.State.Winner = winnerID

	for conn, player := range game.Players {
		statsMsg := map[string]interface{}{
			"type": "save_stats_server",
			"data": map[string]interface{}{
				"winner": winnerID,
				"stats": map[string]interface{}{
					"countKills":  game.Stats[player.PlayerID].Kills,
					"countDeaths": game.Stats[player.PlayerID].Deaths,
				},
			},
		}

		if err := conn.WriteJSON(statsMsg); err != nil {
			fmt.Printf("error sending stats message: %+v\n", statsMsg)
			return err
		}
	}

	return nil
}

func (gs *GameService) generateWeapons(gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	fmt.Printf("ppp ppp ppp, %v\n", len(game.Weapons))
	needWeapons := maxWeaponsOnMap - len(game.Weapons)
	if needWeapons <= 0 {
		return nil
	}
	fmt.Println("yyy yyy yyy")
	freeSpawnPoints := gs.getFreeSpawnPoints(game)
	if len(freeSpawnPoints) < needWeapons {
		needWeapons = len(freeSpawnPoints)
	}
	rand2.Shuffle(len(freeSpawnPoints), func(i, j int) {
		freeSpawnPoints[i], freeSpawnPoints[j] = freeSpawnPoints[j], freeSpawnPoints[i]
	})

	fmt.Printf("fff fff fff, %v; %v\n", needWeapons, freeSpawnPoints)
	for i := 0; i < needWeapons; i++ {
		point := freeSpawnPoints[i]
		typeWeapon := gs.generateWeaponType()
		weapon := &models.Weapon{
			ID:   gs.generateWeaponID(),
			Type: typeWeapon,
			Ammo: gs.getInitialWeaponAmmo(typeWeapon),
			X:    point.X,
			Y:    point.Y,
		}
		game.Weapons[weapon.ID] = weapon
		fmt.Printf("666 %v\n", game.Weapons[weapon.ID])
	}
	fmt.Printf("kkk kkk kkk, %v\n", game.Weapons)
	if err := gs.sendUpdateWeapons(gameID); err != nil {
		return err
	}
	return nil
}

func (gs *GameService) getFreeSpawnPoints(game *models.Game) []models.SpawnPoint {
	freeSpawnPoints := make([]models.SpawnPoint, 0, len(game.WeaponSpawnPoints))
	fmt.Printf("nnn 000 nnn, %v\n", game.WeaponSpawnPoints)
	usedPoints := make(map[string]bool)
	for _, weapon := range game.Weapons {
		posKey := fmt.Sprintf("%.1f,%.1f", weapon.X, weapon.Y)
		usedPoints[posKey] = true
	}
	fmt.Println("000 hhhh 000")
	for _, point := range game.WeaponSpawnPoints {
		posKey := fmt.Sprintf("%.1f,%.1f", point.X, point.Y)
		if !usedPoints[posKey] {
			freeSpawnPoints = append(freeSpawnPoints, point)
		}
	}
	fmt.Printf("000 mmmmmm 000, %v\n", freeSpawnPoints)
	return freeSpawnPoints
}

func (gs *GameService) getInitialWeaponAmmo(weaponType models.WeaponType) int {
	switch weaponType {
	case models.AssaultRifle:
		return 30
	case models.SniperRifle:
		return 5
	case models.Shotgun:
		return 4
	case models.Pistol:
		return 4
	}
	return 0
}

func (gs *GameService) generateWeaponID() string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	id := make([]byte, 8)
	for i := range id {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		id[i] = charset[num.Int64()]
	}
	return string(id)
}

func (gs *GameService) generateWeaponType() models.WeaponType {
	types := []models.WeaponType{models.SniperRifle, models.AssaultRifle, models.Shotgun, models.Pistol}
	num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(types))))
	return types[num.Int64()]
}

func (gs *GameService) sendUpdateWeapons(gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	weapons := make([]*models.Weapon, 0, len(game.Weapons))
	for _, weapon := range game.Weapons {
		weapons = append(weapons, weapon)
	}
	fmt.Printf("+++%v\n===%v\n", weapons, game.Weapons)
	msg := map[string]interface{}{
		"type": "generate_weapons_server",
		"data": map[string]interface{}{
			"weapons": weapons,
		},
	}
	return gs.SendMessageInsideGameToAll(gameID, msg)
}

func (gs *GameService) ChangeWeapon(conn *websocket.Conn, gameID string, data map[string]interface{}) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	if game.State.Status != "playing" {
		return nil
	}
	weaponID := data["weaponID"].(string)
	weapon, exists := game.Weapons[weaponID]
	if !exists {
		return fmt.Errorf("weapon %s does not exists", weaponID)
	}
	player, exists := game.Players[conn]
	if !exists {
		return fmt.Errorf("player not found")
	}
	playerWeapon := &models.PlayerWeapon{
		ID:       weapon.ID,
		PlayerID: player.PlayerID,
		Type:     weapon.Type,
		Ammo:     weapon.Ammo,
	}
	player.CurrentWeapon = playerWeapon

	delete(game.Weapons, weaponID)
	if err := gs.sendChangeWeapon(conn, gameID); err != nil {
		fmt.Println("sdfsdfg")
		return err
	}
	return nil
}

func (gs *GameService) sendChangeWeapon(conn *websocket.Conn, gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	player, exists := game.Players[conn]
	if !exists {
		return fmt.Errorf("player not found")
	}
	fmt.Println("sss sss sss")
	msg := map[string]interface{}{
		"type": "change_weapon_server",
		"data": map[string]interface{}{
			"playerId": player.PlayerID,
			"weaponId": player.CurrentWeapon.ID,
		},
	}
	return gs.SendMessageInsideGame(conn, gameID, msg)
}

func (gs *GameService) deleteWeapon(conn *websocket.Conn, gameID, weaponID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	player, exists := game.Players[conn]
	if !exists {
		return fmt.Errorf("player not found")
	}
	player.CurrentWeapon = nil
	delete(game.Weapons, weaponID)
	if err := gs.sendDeleteWeapon(gameID, weaponID); err != nil {
		return fmt.Errorf("error send delete weapon %v", err)
	}
	return nil
}

func (gs *GameService) sendDeleteWeapon(gameID, weaponID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	_, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	msg := map[string]interface{}{
		"type": "delete_weapon_server",
		"data": map[string]interface{}{
			"weaponId": weaponID,
		},
	}
	return gs.SendMessageInsideGameToAll(gameID, msg)
}

func (gs *GameService) DropWeapon(conn *websocket.Conn, gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	player, exists := game.Players[conn]
	if !exists {
		return fmt.Errorf("player not found")
	}
	weaponDelete := player.CurrentWeapon
	weapon := &models.Weapon{
		ID:   weaponDelete.ID,
		Type: weaponDelete.Type,
		Ammo: weaponDelete.Ammo,
		X:    player.X,
		Y:    player.Y,
	}
	game.Weapons[weapon.ID] = weapon

	if err := gs.sendDropWeapon(conn, gameID, weapon.ID); err != nil {
		return fmt.Errorf("error send delete weapon %v", err)
	}

	if weapon.Ammo <= 0 {
		if err := gs.deleteWeapon(conn, gameID, weapon.ID); err != nil {
			return fmt.Errorf("delete weapon %v", err)
		}
	}
	return nil
}

func (gs *GameService) sendDropWeapon(conn *websocket.Conn, gameID, weaponID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	weapon, exists := game.Weapons[weaponID]
	msg := map[string]interface{}{
		"type": "drop_weapon_server",
		"data": map[string]interface{}{
			"weaponId": weaponID,
			"ammo":     weapon.Ammo,
			"X":        weapon.X,
			"Y":        weapon.Y,
		},
	}
	return gs.SendMessageInsideGame(conn, gameID, msg)
}

func (gs *GameService) SetWeaponsPoints(gameID string, data map[string]interface{}) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	game.WeaponSpawnPoints = make([]models.SpawnPoint, 0)

	fmt.Printf("/// %v\n", data["weapons_points"])
	points, ok := data["weapons_points"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid weapons_points format, expected array")
	}

	fmt.Printf("Processing %d weapon spawn points\n", len(points))

	for i, p := range points {
		point, ok := p.(map[string]interface{})
		if !ok {
			fmt.Printf("Invalid point format at index %d: %v\n", i, p)
			continue
		}

		x, xOk := point["x"].(float64)
		y, yOk := point["y"].(float64)
		if !xOk || !yOk {
			fmt.Printf("Missing coordinates at index %d: %v\n", i, point)
			continue
		}

		spawnPoint := models.SpawnPoint{X: x, Y: y}
		game.WeaponSpawnPoints = append(game.WeaponSpawnPoints, spawnPoint)
		fmt.Printf("Added spawn point %d: X=%.1f, Y=%.1f\n", i, x, y)
	}

	fmt.Printf("Total weapon spawn points set: %d\n", len(game.WeaponSpawnPoints))

	if len(game.WeaponSpawnPoints) > 0 {
		if err := gs.generateWeapons(gameID); err != nil {
			fmt.Printf("Ошибка инициализации оружия: %v\n", err)
			return fmt.Errorf("failed to generate weapons: %w", err)
		}
	} else {
		fmt.Println("No valid weapon spawn points provided")
	}

	return nil
}

func (gs *GameService) SetPlayersPoints(gameID string, data map[string]interface{}) error {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	game.PlayerSpawnPoints = make([]models.SpawnPoint, 0)

	fmt.Printf("/// %v\n", data["players_points"])
	points, ok := data["players_points"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid players_points format, expected array")
	}

	fmt.Printf("Processing %d player spawn points\n", len(points))

	for i, p := range points {
		point, ok := p.(map[string]interface{})
		if !ok {
			fmt.Printf("Invalid point format at index %d: %v\n", i, p)
			continue
		}

		x, xOk := point["x"].(float64)
		y, yOk := point["y"].(float64)
		if !xOk || !yOk {
			fmt.Printf("Missing coordinates at index %d: %v\n", i, point)
			continue
		}

		spawnPoint := models.SpawnPoint{X: x, Y: y}
		game.PlayerSpawnPoints = append(game.PlayerSpawnPoints, spawnPoint)
		fmt.Printf("Added spawn point %d: X=%.1f, Y=%.1f\n", i, x, y)
	}

	fmt.Printf("Total weapon spawn points set: %d\n", len(game.PlayerSpawnPoints))

	if len(game.PlayerSpawnPoints) > 0 {
		// if err := gs.generateWeapons(gameID); err != nil {
		// 	fmt.Printf("Ошибка инициализации оружия: %v\n", err)
		// 	return fmt.Errorf("failed to generate weapons: %w", err)
		// }
	} else {
		fmt.Println("No valid weapon spawn points provided")
	}

	return nil
}

func (gs *GameService) ReadyToBattle(conn *websocket.Conn, gameID string) error {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	player, exists := game.Players[conn]
	if !exists {
		return fmt.Errorf("player not found")
	}
	fmt.Println("777 777 777")
	game.ReadyCheck[player.PlayerID] = true
	return nil
}

func (gs *GameService) GetGameState(gameID string) (*models.GameState, error) {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return nil, fmt.Errorf("game %s does not exist", gameID)
	}
	return &game.State, nil
}
