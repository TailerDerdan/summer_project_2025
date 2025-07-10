<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\User\User;
use App\Repository\UserRepository;
use App\Infrastructure\User\UserServiceInterface;

class UserService implements UserServiceInterface {
    public function __construct(
        private UserRepository $userRepository
    ) {}
    public function getById(int $userId): ?User {
        $user = $this->userRepository->getById($userId);
        return $user;
    }
    public function get(string $nickName): ?User {
        $user = $this->userRepository->get($nickName);
        return $user;
    }
    public function save(array $user): int {
        $userId = $this->userRepository->save($user);
        return $userId;
    }

}