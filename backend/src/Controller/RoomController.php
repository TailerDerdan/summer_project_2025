<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\User\UserServiceInterface;
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
            "userId" => $user->getUserId() ?? null,
            "name" => $data['name'],
            "gamemode" => $data['gamemode'],
            "isOpen" => $data['isOpen'] ?? true,
        ];
        $roomId = $this->roomService->create($roomData);
        $this->userService->updateRoomId($roomData["userId"], $roomId);
        $roomData["userId"] = strval($roomData["userId"]);
        $roomData["roomId"] = strval($roomId);
        $response = $this->httpClient->request(
            'POST',
            "http://ws:8080/ws/room/create",
            [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => $roomData,
            ],
        );
        $statusCode = $response->getStatusCode();
        if ($statusCode != Response::HTTP_OK) {
            $errorContent = $response->getContent(false);
            echo $errorContent;
            return new Response("Go service returned $statusCode: $errorContent", Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $jsonContent = json_decode($response->getContent(), true);
        return $this->json([
            'roomId' => $jsonContent['roomId'],
            'userId' => $user->getUserId() ?? null,
            'nickname' => $user->getNickname() ?? null,
        ]);
    }

    public function join(Request $request): Response {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json([
            'userId' => $user->getUserId() ?? null,
            'nickname' => $user->getNickname() ?? null,
        ]);
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
