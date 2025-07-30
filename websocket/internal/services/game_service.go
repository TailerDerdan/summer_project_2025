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

var weaponSpawnPoints = []models.SpawnPoint{
	{X: 100, Y: 100},
	{X: 500, Y: 100},
	{X: 100, Y: 300},
	{X: 500, Y: 300},
	{X: 300, Y: 200},
	{X: 200, Y: 400},
	{X: 400, Y: 400},
	{X: 100, Y: 500},
	{X: 500, Y: 500},
	{X: 300, Y: 300},
	{X: 1000, Y: 1000},
	{X: 1100, Y: 1100},
	{X: 1200, Y: 1200},
	{X: 1300, Y: 1300},
	{X: 1400, Y: 1400},
}

const maxWeaponsOnMap = 10

func (gs *GameService) CreateGame(roomID string, data map[string]interface{}) *models.Game {
	//gs.mu.Lock()
	//defer gs.mu.Unlock()
	gameType := data["gameType"].(string)
	gameID := gs.generateGameID(gameType)
	game := &models.Game{
		GameID:    gameID,
		RoomID:    roomID,
		Type:      gameType,
		Players:   make(map[*websocket.Conn]*models.PlayerInfo),
		Stats:     make(map[string]*models.PlayerStats),
		Weapons:   make(map[string]*models.Weapon),
		StartTime: time.Now(),
		Duration:  3 * time.Minute,
		State: models.GameState{
			CountDown: 0,
			Status:    "waiting",
		},
		ReadyCheck: make(map[string]bool),
	}
	gs.activeGames[gameID] = game
	//if points, ok := data["weaponsPoints"].([]interface{}); ok {
	//	weaponSpawnPoints = make([]models.SpawnPoint, 0, len(points))
	//
	//	for _, p := range points {
	//		if point, ok := p.(map[string]interface{}); ok {
	//			spawnPoint := models.SpawnPoint{
	//				X: point["x"].(float64),
	//				Y: point["y"].(float64),
	//			}
	//			weaponSpawnPoints = append(weaponSpawnPoints, spawnPoint)
	//		}
	//	}
	//}
	if err := gs.generateWeapons(gameID); err != nil {
		fmt.Printf("Ошибка инициализации оружия%v", err)
	}
	go gs.waitingPlayers(gameID)
	return game
}

func (gs *GameService) waitForPlayers(gameID string) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	timeout := time.After(1 * time.Minute)

	for {
		select {
		case <-ticker.C:
			gs.mu.Lock()
			game, exists := gs.activeGames[gameID]
			if !exists {
				gs.mu.Unlock()
				return
			}

			allConnected := true
			for _, player := range game.Players {
				if !game.ReadyCheck[player.PlayerID] {
					allConnected = false
					break
				}
			}

			if allConnected {
				game.State.Status = "countdown"
				game.State.CountDown = 3
				gs.notifyGameState(gameID)
				gs.mu.Unlock()

				go gs.startCountdown(gameID)
				return
			}

			elapsed := time.Since(game.StartTime)
			remainingWait := 1*time.Minute - elapsed
			if remainingWait < 0 {
				remainingWait = 0
			}

			msg := map[string]interface{}{
				"type": "waiting_update",
				"data": map[string]interface{}{
					"remaining": int(remainingWait.Seconds()),
					"connected": len(game.Players),
					"waiting":   true,
				},
			}
			gs.SendMessageInsideGameToAll(gameID, msg)
			gs.mu.Unlock()

		case <-timeout:
			gs.mu.Lock()
			game, exists := gs.activeGames[gameID]
			if !exists {
				gs.mu.Unlock()
				return
			}

			game.State.Status = "countdown"
			game.State.CountDown = 3
			gs.notifyGameState(gameID)
			gs.mu.Unlock()

			// Запускаем обратный отсчет
			go gs.startCountdown(gameID)
			return
		}
	}
}

func (gs *GameService) startCountdown(gameID string) {
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

		if game.State.CountDown <= 0 {
			game.State.Status = "playing"
			game.StartTime = time.Now()
			gs.notifyGameState(gameID)

			go gs.startGameTimer(gameID)
			gs.mu.Unlock()
			return
		}
		gs.mu.Unlock()
	}
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
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	game.Players[conn] = player
	game.Stats[player.PlayerID] = &models.PlayerStats{}
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
	if err := gs.SendMessageInsideGame(conn, gameID, joinMsg); err != nil {
		fmt.Println("error sending join message")
		return err
	}
	return nil
}

func (gs *GameService) getGameState(gameID string) ([]models.PlayerInfo, , error) {
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

func (gs *GameService) StartTimer(conn *websocket.Conn, gameID string) {
	gs.mu.Lock()
	game, exists := gs.activeGames[gameID]
	gs.mu.Unlock()

	if !exists {
		return //fmt.Errorf("game %s does not exist", gameID)
	}

	go func() {
		ticker := time.NewTicker(1 * time.Second)
		weaponTicker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		defer weaponTicker.Stop()

		for {
			select {
			case <-ticker.C:
				elapsed := time.Since(game.StartTime)
				remaining := game.Duration - elapsed
				if remaining <= 0 {
					if err := gs.saveGameStats(conn, gameID); err != nil {
						fmt.Printf("123 error saving stats message: %v\n", err)
						return
					}
					if err := gs.endGame(gameID); err != nil {
						fmt.Printf("123 error sending end message: %v\n", err)
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
					fmt.Printf("123 error sending time message: %v\n", err)
					return
				}
			case <-weaponTicker.C:
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
	players, err := gs.getGameState(gameID)
	if err != nil {
		return err
	}
	return conn.WriteJSON(map[string]interface{}{
		"type": "init_players_server",
		"data": map[string]interface{}{
			"players": players,
			"weapons": weapons,
		},
	})
}

func (gs *GameService) saveGameStats(conn *websocket.Conn, gameID string) error {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}

	winnerID := gs.determineWinner(gameID)
	game.State.Winner = winnerID

	player := game.Players[conn]
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
	return nil
}

func (gs *GameService) generateWeapons(gameID string) error {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	needWeapons := maxWeaponsOnMap - len(game.Weapons)
	if needWeapons <= 0 {
		return nil
	}
	freeSpawnPoints := gs.getFreeSpawnPoints(game)
	if len(freeSpawnPoints) < needWeapons {
		needWeapons = len(freeSpawnPoints)
	}
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
	}
	if err := gs.sendUpdateWeapons(gameID); err != nil {
		return err
	}
	return nil
}

func (gs *GameService) getFreeSpawnPoints(game *models.Game) []models.SpawnPoint {
	freeSpawnPoints := make([]models.SpawnPoint, 0, len(weaponSpawnPoints))

	usedPoints := make(map[string]bool)
	for _, weapon := range game.Weapons {
		posKey := fmt.Sprintf("%.1f,%.1f", weapon.X, weapon.Y)
		usedPoints[posKey] = true
	}

	for _, point := range weaponSpawnPoints {
		posKey := fmt.Sprintf("%.1f,%.1f", point.X, point.Y)
		if !usedPoints[posKey] {
			freeSpawnPoints = append(freeSpawnPoints, point)
		}
	}

	return freeSpawnPoints
}

func (gs *GameService) getInitialWeaponAmmo(weaponType models.WeaponType) int {
	switch weaponType {
	case models.WeaponRifle:
		return 10
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
	types := []models.WeaponType{models.WeaponPistol, models.WeaponRifle, models.WeaponShotgun, models.WeaponSniper}
	num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(types))))
	return types[num.Int64()]
}

func (gs *GameService) sendUpdateWeapons(gameID string) error {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	weapons := make([]*models.Weapon, 0, len(game.Weapons))
	for _, weapon := range game.Weapons {
		weapons = append(weapons, weapon)
	}
	msg := map[string]interface{}{
		"type": "generate_weapons_server",
		"data": map[string]interface{}{
			"weapons": weapons,
		},
	}
	return gs.SendMessageInsideGameToAll(gameID, msg)
}

func (gs *GameService) ChangeWeapon(conn *websocket.Conn, gameID string, data map[string]interface{}) error {
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
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
	game, exists := gs.activeGames[gameID]
	if !exists {
		return fmt.Errorf("game %s does not exist", gameID)
	}
	player, exists := game.Players[conn]
	if !exists {
		return fmt.Errorf("player not found")
	}
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

	if err := gs.sendDropWeapon(gameID, weapon.ID); err != nil {
		return fmt.Errorf("error send delete weapon %v", err)
	}

	if weapon.Ammo <= 0 {
		if err := gs.deleteWeapon(conn, gameID, weapon.ID); err != nil {
			return fmt.Errorf("delete weapon %v", err)
		}
	}
	return nil
}

func (gs *GameService) sendDropWeapon(gameID, weaponID string) error {
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
	return gs.SendMessageInsideGameToAll(gameID, msg)
}
