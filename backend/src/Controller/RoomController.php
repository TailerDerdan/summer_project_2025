<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\User\UserServiceInterface;
use App\Services\WebSocketClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class RoomController extends AbstractController {
    public function __construct(
        private RoomServiceInterface $roomService,
        private UserServiceInterface $userService,
        private httpClientInterface $httpClient,
    ) {}

    public function createPage(): Response
    {
        return $this->render("Room/CreateRoom.html.twig");
    }
    public function create(Request $request): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        $data = json_decode($request->getContent(), true);
        $roomData = [
            "hostId" => $user->getUserId() ?? null,
            "name" => $data['name'],
            "gamemode" => $data['gamemode'],
            "isOpen" => $data['isOpen'] ?? true,
        ];
        $roomId = $this->roomService->create($roomData);
        $this->userService->updateRoomId($roomData["hostId"], $roomId);
        $roomData["hostId"] = strval($roomId);
        $roomData["roomId"] = strval($roomId);
        $response = $this->httpClient->request(
            'POST',
            "http://ws:8080/ws/room/create",
            [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => $roomData,
                'timeout' => 5 // Таймаут 5 секунд
            ],
        );
        $statusCode = $response->getStatusCode();
        if ($statusCode != Response::HTTP_OK) {
            $errorContent = $response->getContent(false);
            return new Response("Go service returned $statusCode: $errorContent", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

//        $this->notifyWebSocketUpdate('room_created', [
//            'roomId' => $roomId,
//            'name' => $roomData['name']
//        ]);

        $jsonContent = json_decode($response->getContent(), true);
        return $this->json([
            'roomId' => $jsonContent['roomId'],
            'ws_url' => $jsonContent['ws_url'], //'ws://localhost:8080/ws/room_'.$roomId
        ]);
//        return $this->json([
//            "roomId" => $roomId,
//            "ws_url" => "ws://localhost:8080/ws/room_" . $roomId,
//        ]);
//        return $this->redirectToRoute('show_room', ['id' => $roomId]);
    }

    public function listRooms(Request $request): Response
    {
        if ($request->isXmlHttpRequest()) {
            $rooms = $this->roomService->getAllRooms();
            return $this->json([
                'rooms' => $rooms,
                'ws_url' => 'ws://localhost:8080/ws/global-updates'
            ]);
        }

        return $this->render('Room/list.html.twig', [
            'initialRooms' => $this->roomService->getAllRooms(),
            'ws_url' => 'ws://localhost:8080/ws/global-updates'
        ]);
    }
    private function notifyWebSocketUpdate(string $eventType, array $data): void
    {
        try {
            $this->httpClient->request('POST', 'http://ws:8080/notify-update', [
                'json' => [
                    'type' => $eventType,
                    'data' => $data,
                    'timestamp' => time()
                ],
                'timeout' => 1
            ]);
        } catch (\Exception $e) {
            $this->logger->error('WS notification failed: '.$e->getMessage());
        }
    }

    public function createRoom(Request $request): Response
    {
        $roomData = $request->request->all();
        return $this->json("roomId", $roomData["roomId"]);
    }

    public function showRoom(int $id): Response
    {
        $room = $this->roomService->get($id);
        return $this->render("Room/Room.html.twig", ["room" => $room]);
    }

    public function editPlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }

    public function deletePlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }
}
