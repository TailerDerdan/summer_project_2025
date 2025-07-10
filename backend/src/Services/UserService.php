<?php
declare (strict_types= 1);

namespace App\Services;

use App\Repository\UserRepository;

class UserService implements UserServiceInterface {
    private UserRepository $userRepository;
    public function __construct(UserRepository $userRepository) {
        $this->userRepository = $userRepository;
    }
}