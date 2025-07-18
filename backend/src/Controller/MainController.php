<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class MainController extends AbstractController {
    public function __construct(
        private UserServiceInterface $userService,
        private RoomServiceInterface $roomService
    ) {}

    public function mainPage(): Response {
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('login');
        }
        $rooms = $this->roomService->getAll();
        return $this->render('Main/MainPage.html.twig', [
            'user' => $user,
            'rooms' => $rooms
        ]);
    }
}
