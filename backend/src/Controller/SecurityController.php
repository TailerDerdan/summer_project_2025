<?php
declare (strict_types=1);

namespace App\Controller;

use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController {
    public function __construct(
        private UserServiceInterface $userService
    ) {}
    public function login(AuthenticationUtils $authenticationUtils): Response {
        if ($this->getUser()) {
            return $this->redirectToRoute("main_page");
        }
        return $this->render("Auth/Login.html.twig", [
            "last_name"=> $authenticationUtils->getLastUsername(),
            "error"=> $authenticationUtils->getLastAuthenticationError(),
        ]);
    }

    public function loginProc(Request $request): Response {
        $nickName = $request->request->get("nickName");
        $password = $request->request->get("password");
        $user = $this->userService->get($nickName);
        if (!$user) {
            $this->addFlash("error","Такого пользователя нет(");
            return $this->redirectToRoute("login");
        }
        if (!password_verify($password, $user->getPassword())) {
            $this->addFlash("error","Неверный пароль(");
            return $this->redirectToRoute("login");
        }
        return $this->redirectToRoute("main_page", ['rooms' => ['name' => 'TEST']]);
    }

    public function registry(): Response {
        return $this->render("Auth/Registry.html.twig");
    }

    public function registryProc(Request $request): Response {
        $userData = $request->request->all();
        if ($userData["password"] != $userData["confirm_password"]) {
            $this->addFlash("error","Пароли не совпадают");
            return $this->redirectToRoute("registry");
        }
        $userId = $this->userService->save($userData);
        if (!$userId) {
            $this->addFlash("error","Не получилось сохранить пользователя(");
            return $this->redirectToRoute("registry_Proc");
        }
        return $this->redirectToRoute("main_page");
    }

    public function logout(AuthenticationUtils $authenticationUtils): void {
    }
}
