<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Entity\Room\PlayRoom;
use App\Entity\User\User;
use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\User\UserServiceInterface;
use App\Services\SessionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class RoomController extends AbstractController {
    public function __construct(
        private RoomServiceInterface $roomService,
        private SessionService $session,
    ) {}

    public function createPage(): Response {
        return $this->render("Room/CreateRoom.html.twig");
    }
    public function create(Request $request): Response {
        $room = $request->request->all();
        $roomId = $this->roomService->create($room);
        return $this->redirectToRoute('main_page', ['rooms' => ['name' => 'TEST']]);
    }
}