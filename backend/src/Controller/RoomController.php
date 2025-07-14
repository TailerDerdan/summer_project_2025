<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\Room\RoomServiceInterface;
use App\Services\PlayRoomService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class RoomController extends AbstractController {
    public function __construct(
        private RoomServiceInterface $roomService,
    ) {}

    public function createPage(): Response {
        return $this->render("Room/CreateRoom.html.twig");
    public function showPlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }
    public function create(Request $request): Response {
        $room = $request->request->all();
        $roomId = $this->roomService->create($room);
        return $this->redirectToRoute('main_page', ['rooms' => ['name' => 'TEST']]);

    public function editPlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }

    public function deletePlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }
}
