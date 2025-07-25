<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Entity\User\User;
use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
        return $this->render('Room/RoomMenu.html.twig', [
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

    public function saveMap(Request $request): JsonResponse {

        if ($_SERVER['CONTENT_TYPE'] !== 'application/json') {
            http_response_code(502);
            die(json_encode([
                'success' => false,
                'error' => 'Invalid Content-Type. Expected: application/json'
            ]));
        }
        
        $jsonData = $request->getContent();
        if (empty($jsonData)) {
            http_response_code(601);
            echo json_encode([
                'success' => false,
                'error' => 'Пустой запрос'
            ]);
            dump($jsonData);
            die;
        }
        $data = json_decode($jsonData, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Невалидный JSON: ' . json_last_error_msg()
            ]);
            die;
        }

        if (file_exists("../mapEditor/maps/maps.json"))
        {
            http_response_code(302);
            echo json_encode([
                'success' => false,
                'error' => 'Невалидный JSON: ' . json_last_error_msg()
            ]);
            die;
        }

        $mapsJson = file_get_contents("./mapEditor/maps/maps.json");
        $maps = json_decode($mapsJson, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Невалидный JSON: ' . json_last_error_msg()
            ]);
            die;
        }

        $maps['maps'][] = $data;
        file_put_contents("./mapEditor/maps/maps.json", json_encode($maps, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $this->json(["success"=> true]);
    }

    public function mapRedactor(): Response {
        return $this->render('MapRedactor/MapRedactor.html.twig');
    }
}
