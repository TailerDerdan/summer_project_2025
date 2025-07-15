<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class RoomController extends AbstractController {
    public function __construct(
        private RoomServiceInterface $roomService,
        private UserServiceInterface $userService,
    ) {}

    public function createPage(): Response
    {
        return $this->render("Room/CreateRoom.html.twig");
    }
    public function create(Request $request): Response
    {
        $user = $this->getUser();
        $roomData = [
            "hostId" => $user->getUserId(),
            "name" => $request->request->get('name'),
            "gamemode" => $request->request->get('gamemode'),
        ];
        $roomId = $this->roomService->create($roomData);
        $this->userService->updateRoomId($user->getUserId(), $roomId);
        return $this->redirectToRoute('show_room', ['id' => $roomId]);
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
