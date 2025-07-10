<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Entity\User\User;
use App\Infrastructure\User\UserServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class UserController extends AbstractController {
    public function __construct(
        private UserServiceInterface $userService
    ) {}

    public function showProfile(int $id): Response {
        $user = $this->userService->getById($id);
        return $this->render("User/ShowProfile.html.twig", ['user' => $user]);
    }

}