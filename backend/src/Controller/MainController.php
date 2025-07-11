<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Entity\User\User;
use App\Infrastructure\User\UserServiceInterface;
use App\Services\SessionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class MainController extends AbstractController {
    public function __construct(
        private UserServiceInterface $userService,
        private SessionService $session,
    ) {}

    public function mainPage(): Response {
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('login');
        }
        return $this->render('Main/MainPage.html.twig', [
            'user' => $user,
            'rooms' => []
        ]);
    }
}