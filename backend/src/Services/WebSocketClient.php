<?php
declare(strict_types=1);

namespace App\Services;


use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WebSocketClient
{
    private string $websocketUrl = "http://ws:8080";
    public function __construct(private HttpClientInterface $httpClient) {
    }

    public function ConnectUserToWS(array $userData): Response
    {
        $response = $this->httpClient->request(
            'POST',
            $this->websocketUrl . "/connection",
            [
                'json' => [
                    'userId' => $userData['userId'],
                    'ws_conn_id' => $userData['ws_conn_id'],
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'timeout' => 5,
            ],
        );
        $statusCode = $response->getStatusCode();
        if ($statusCode != Response::HTTP_OK) {
            return new Response('Error connection', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        return new Response("success", Response::HTTP_OK, []);
    }

    public function CreateRoom(array $roomData): Response {
        $response = $this->httpClient->request(
            'GET',
            $this->websocketUrl . '/room/createRoom',
            [
                'json' => [
                    'hostId' => $roomData['hostId'],
                    'name' => $roomData['name'],
                    'gamemode' => $roomData['gamemode'],
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
            ],
        );
        $statusCode = $response->getStatusCode();
        if ($statusCode != Response::HTTP_OK) {
            return new Response('Error, statusCode', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        return $this->json([
            'roomId' => $roomData['roomId'],
            'ws_url' => 'ws://ws:8080/room_' . $roomData['roomId'],
        ]);
    }


}
