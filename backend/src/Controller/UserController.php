<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Entity\User\User;
use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UserController extends AbstractController {
    public function __construct(
        private UserServiceInterface $userService
    ) {}

    public function showProfile(int $id): Response {
        $user = $this->userService->getById($id);
        return $this->render("User/ShowProfile.html.twig", ['user' => $user]);
    }

    public function updateStats(Request $request): Response {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        $data = json_decode($request->getContent(), true);
        $statsData = $data['stats'];
        $stats = [
            "countKills" => $statsData["countKills"],
            "countDeaths" => $statsData["countDeaths"],
        ];
        if ($data["winner"] == strval($user->getUserId())) {
            $stats["winner"] = $data["winner"];
        }
        $this->userService->updateStats($user->getUserId(), $stats);
        return new JsonResponse(['success' => true]);
    }
}
