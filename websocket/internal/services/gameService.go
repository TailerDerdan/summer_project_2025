package services

import (
	"github.com/TailerDerdan/summer_project_2025/websocket/internal/repository"
	"github.com/gorilla/websocket"
	"log"
)

type GameService struct {
	repository *repository.SymfonyRepository
}

func NewGameService(repository *repository.SymfonyRepository) *GameService {
	return &GameService{repository: repository}
}

func (s *GameService) CreateRoom(roomData map[string]string) (string, error) {
	roomId, err := s.repository.CreateRoom(roomData)
	if err != nil {
		return "", err
	}
	return roomId, nil
}

func (s *GameService) GetRoom(roomId string) (map[string]string, error) {
	room, err := s.repository.GetRoom(roomId)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (s *GameService) HandlePlayer(conn *websocket.Conn, roomId, playerId string) {
	allowed, err := s.repository.IsPlayerAllowed(playerId, roomId)
	if err != nil || !allowed {
		log.Printf("Player %s is not allowed: %v", playerId, err)
		conn.Close()
		return
	}

	err = s.repository.AddPlayer(roomId, playerId)
	if err != nil {
		log.Printf("Error adding player: %v", err)
		return
	}
}

func (s *GameService) HandlePlayerReady(roomId, playerId string, ready bool) {
	if err := s.repository.SetPlayerReady(roomId, playerId); err != nil {
		log.Printf("Error setting player ready: %v", err)
		return
	}
	isReady, err := s.repository.IsRoomReady(roomId)
	if err != nil {
		log.Printf("Error checking player ready: %v", err)
		return
	}
	if !isReady {
		log.Printf("Player %s is not ready", playerId)
	}
	s.StartBattle(roomId)
}

func (s *GameService) StartBattle(roomId string) {
	if err := s.repository.StartBattle(roomId); err != nil {
		log.Printf("Error starting buttle: %v", err)
	}

}
