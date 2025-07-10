<?php
declare (strict_types= 1);

namespace App\Repository;

use App\Entity\User\User;

interface UserRepositoryInterface {
    
    public function saveUser(User $user): int;
    public function findUser(int $userId): ?User;
    public function saveAvatarPath(int $userId, string $avatarPath): bool;
    public function getUsers(): array;
    public function deleteUser(int $userId): void;
    public function updateUser(User $user): void;
}