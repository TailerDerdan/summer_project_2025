<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use App\Services\SessionService;

class AuthController extends AbstractController {
    private SessionService $session;
    
    public function __construct(
        private UserServiceInterface $userService,
        SessionService $session,
    ) {
        $this->session = $session;
    }
    public function loginPage(): Response {
        return $this->render("Auth/Login.html.twig");
    }
    public function login(Request $request): Response {
        $nickName = $request->request->get("nickName");
        $password = $request->request->get("password");
        $user = $this->userService->get($nickName);
        if (!$user) {
            $this->addFlash("error","Такого пользователя нет(");
            return $this->redirectToRoute("login_page");
        }
        if (!password_verify($password, $user->getPassword())) {
            $this->addFlash("error","Неверный пароль(");
            return $this->redirectToRoute("login");
        }
        $this->session->login($user->getUserId(), $user->getNickName());

        return $this->redirectToRoute("main_page", ['rooms' => ['name' => 'TEST']]);
    }

    public function registryPage(): Response {
        return $this->render("Auth/Registry.html.twig");
    }
    public function registry(Request $request): Response {
        $userData = $request->request->all();
        if ($userData["password"] != $userData["confirm_password"]) {
            $this->addFlash("error","Пароли не совпадают");
            return $this->redirectToRoute("registry_page");
        }
        $userId = $this->userService->save($userData);
        if (!$userId) {
            $this->addFlash("error","Не получилось сохранить пользователя(");
            return $this->redirectToRoute("registry_page");
        }
        $this->session->login($userId, $userData['nickName']);
        return $this->redirectToRoute("main_page", ['rooms' => ['name' => 'TEST']]);
    }
    public function logout(): Response {
        $this->session->logout();
        return $this->redirectToRoute('login');
    }
}