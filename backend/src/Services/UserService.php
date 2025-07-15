<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\User\User;
use App\Infrastructure\User\UserRepositoryInterface;
use App\Repository\UserRepository;
use App\Infrastructure\User\UserServiceInterface;
use App\Security\UserProvider;

class UserService implements UserServiceInterface {
    public function __construct(
        private UserRepositoryInterface $userRepository
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
    public function updateRoomId(int $userId, int $roomId): void {
        $this->userRepository->updateRoomId($userId, $roomId);
    }
}
