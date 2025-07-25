package service

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/models"
	"github.com/gorilla/websocket"
	"sync"
	"time"
)

type GameService struct {
	games map[string]*models.Game
	mu    sync.Mutex
}

func NewGameService() *GameService {
	return &GameService{
		games: make(map[string]*models.Game),
	}
}

func (s *GameService) CreateGame(gameID, roomID, gameType string, duration time.Duration) *models.Game {
	s.mu.Lock()
	defer s.mu.Unlock()

	game := &models.Game{
		GameID:    gameID,
		RoomID:    roomID,
		Type:      gameType,
		Players:   make(map[*websocket.Conn]*models.PlayerInfo),
		Stats:     make(map[string]*models.PlayerStats),
		StartTime: time.Now(),
		Duration:  duration,
	}

	s.games[gameID] = game
	return game
}

// Другие методы работы с играми...
