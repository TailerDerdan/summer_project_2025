<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class AppController extends AbstractController {
    public function __construct(
        private UserServiceInterface $userService
    ) {}
    public function loginPage(): Response {
        return $this->render("Login/Login.html.twig");
    }
    public function login(Request $request): Response {
        $nickName = $request->request->get("nickName");
        $pass = $request->request->get("password");
        $user = $this->userService->get($nickName);
        if ($user->getPassword() !== $pass) {
            return $this->redirectToRoute("login");
        }
        return $this->redirectToRoute("main_page", ['userId' => $user->getUserId()]);
    }
    public function registryPage(): Response {
        return $this->render("Login/Registry.html.twig");
    }
    public function registry(Request $request): Response {
        $userData = $request->request->all();
        $userId = $this->userService->save($userData);
        return $this->redirectToRoute("main_page", ['userId' => $userId]);
    }
    public function logout(): Response {
        return $this->redirectToRoute('login');
    }
    public function mainPage(int $userId): Response {
        //$userId = $request->request->get('userId');
        $user = $this->userService->getById($userId);
        return $this->render('Main/MainPage.html.twig', ['user' => $user]);
    }
}