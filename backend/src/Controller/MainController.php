<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Entity\User\User;
use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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
            'rooms' => $rooms,
        ]);
    }

    /**
     * @var User[] $users
     */
    public function getUsers(): JsonResponse {
        $users = $this->userService->getAll();
        return $this->json([
            'users' => $users,
        ]);
    }

    public function saveMap(): JsonResponse {
        $jsonDate = file_get_contents("php://input");
        $data = json_decode($jsonDate, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            die(json_encode(['error' => 'Невалидный JSON']));
        }

        $mapsJson = file_get_contents("./../../../frontend/maps/maps.json");
        $maps = json_decode($mapsJson, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            die(json_encode(['error' => 'Невалидный JSON']));
        }

        $maps['maps'][] = $data;
        file_put_contents("./../../../frontend/maps/maps.json", $maps);
    }
}
