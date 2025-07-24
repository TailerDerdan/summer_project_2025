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
        $user = $this->getUser();
        return $this->render('Room/RoomCreate.html.twig', ["user" => $user]);
    }
    public function create(Request $request): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        $data = json_decode($request->getContent(), true);
        $roomData = [
            "playersCount" => 1,
            "maxPlayers" => 5,
            "nickname" => $user->getNickname(),
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
            "http://87.228.90.3:8080/ws/room/create",
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

    public function join(int $roomId): Response {
        $user = $this->getUser();
        if ($user->getRoomId() != (int)$roomId) {
            $this->userService->updateRoomId($user->getUserId(), (int)$roomId);
            $this->roomService->addUserInRoom($user->getUserId(), (int)$roomId);
        }
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json([
            'userId' => $user->getUserId() ?? null,
            'nickname' => $user->getNickname() ?? null,
        ]);
    }

    public function show(int $id): Response
    {
        $user = $this->getUser();
        $room = $this->roomService->get($id);
        return $this->render("Room/RoomLobby.html.twig", ["room" => $room, "user" => $user]);
    }

    public function edit(): Response
    {
        return $this->render("asdf.html.twig");
    }

    public function delete(int $id): Response
    {
        $this->roomService->delete($id);
        return $this->json([
            "status" => "success"
        ]);
    }

    public function deleteUser(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $roomId = $data["roomId"];
        $user = $this->getUser();
        if ($user->getRoomId() == (int)$roomId) {
            $this->userService->deleteRoomId($user->getUserId());
            $this->roomService->removeUserFromRoom($user->getUserId(), (int)$roomId);
        }
        return $this->json([
            "status" => "success"
        ]);
    }

    public function getUsers(): Response {
        $users = $this->userService->getAll();
        return $this->json([
            'users' => $users,
        ]);
    }
}
