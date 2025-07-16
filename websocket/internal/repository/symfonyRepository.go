package repository

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
)

type SymfonyRepository struct {
	BaseUrl    string
	httpClient *http.Client
}

func NewSymfonyRepository(baseUrl string) *SymfonyRepository {
	return &SymfonyRepository{baseUrl, &http.Client{}}
}

func (r *SymfonyRepository) CreateRoom(room map[string]string) (string, error) {
	req, err := json.Marshal(room)
	if err != nil {
		return "", err
	}
	resp, err := r.httpClient.Post(fmt.Sprintf(
		"%s/room/createRoom", r.BaseUrl),
		"application/json",
		bytes.NewBuffer(req))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return "", errors.New(fmt.Sprintf("Failed to create room: %v", resp.Status))
	}
	var respBody struct {
		RoomId string `json:"roomId"`
	}
	err = json.NewDecoder(resp.Body).Decode(respBody)
	if err != nil {
		return "", err
	}
	return respBody.RoomId, nil
}

func (r *SymfonyRepository) GetRoom(roomId string) (map[string]string, error) {
	resp, err := r.httpClient.Get(fmt.Sprintf("%s/room/%s", r.BaseUrl, roomId))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New(fmt.Sprintf("Failed to get room: %v", resp.Status))
	}
	var room map[string]string
	err = json.NewDecoder(resp.Body).Decode(&room)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (r *SymfonyRepository) IsPlayerAllowed(roomId, playerId string) (bool, error) {
	resp, err := r.httpClient.Get(fmt.Sprintf("%s/room/access?player=%s&roomId=%s", r.BaseUrl, playerId, roomId))
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return false, errors.New("access denied")
	}
	return true, nil
}

func (r *SymfonyRepository) AddPlayer(roomId, playerId string) error {
	data := url.Values{}
	data.Add("playerId", playerId)
	data.Add("roomId", roomId)

	resp, err := r.httpClient.PostForm(fmt.Sprintf("%s/room/addPlayer", r.BaseUrl), data)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New(fmt.Sprintf("did not add player: %s, to room: %s", playerId, roomId))
	}
	return nil
}

func (r *SymfonyRepository) SetPlayerReady(roomId, playerId string) error {
	request, _ := json.Marshal(map[string]interface{}{
		"playerId": playerId,
		"roomId":   roomId,
	})
	req, err := http.NewRequest(
		http.MethodPost,
		fmt.Sprintf("%s/room/setPlayerReady", r.BaseUrl),
		bytes.NewBuffer(request),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New(fmt.Sprintf("did not set player ready: %s, to room: %s", playerId, roomId))
	}
	return nil
}

func (r *SymfonyRepository) IsRoomReady(roomId string) (bool, error) {
	resp, err := http.NewRequest(
		http.MethodGet,
		fmt.Sprintf("%s/room/isRoomReady", r.BaseUrl),
		nil,
	)
	if err != nil {
		return false, err
	}
	resp.Header.Set("Content-Type", "application/json")
	req, err := r.httpClient.Do(resp)
	if err != nil {
		return false, err
	}
	defer req.Body.Close()
	if req.StatusCode != http.StatusOK {
		return false, errors.New(fmt.Sprintf("did not set player ready: %s, to room: %s", req.Status, roomId))
	}
	var result struct {
		Ready bool `json:"ready"`
	}
	if err := json.NewDecoder(req.Body).Decode(&result); err != nil {
		return false, err
	}
	return true, nil
}

func (r *SymfonyRepository) StartBattle(roomId string) error {
	req, err := http.NewRequest(
		http.MethodPost,
		fmt.Sprintf("%s/battle/start", r.BaseUrl),
		bytes.NewBuffer([]byte(fmt.Sprintf(`{"roomId": "%s"}`, roomId))),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New(fmt.Sprintf("did not start buttle: %s, to room: %s", resp.Status, roomId))
	}
	return nil
}
