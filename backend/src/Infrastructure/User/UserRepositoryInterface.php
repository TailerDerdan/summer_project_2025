<?php
declare (strict_types= 1);

namespace App\Infrastructure\User;

use App\Entity\User\User;

interface UserRepositoryInterface {

    public function save(array $user): int;
    public function getById(int $userId): ?User;
    public function get(string $nickName): ?User;
    public function saveAvatarPath(int $userId, string $avatarPath): bool;
    public function getAll(): array;
    public function delete(int $userId): void;
    public function update(User $user): void;
    public function updateRoomId(int $userId, int $roomId): void;
}
