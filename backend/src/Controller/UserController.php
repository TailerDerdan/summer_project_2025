<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Services\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class UserController extends AbstractController {
    private UserService $userService;
    public function __construct(UserService $userService) {
        $this->userService = $userService;
    }
}