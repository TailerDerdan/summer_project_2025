<?php
declare (strict_types= 1);

namespace App\Infrastructure\User;

use App\Entity\User\User;

interface UserRepositoryInterface {

    public function save(array $userData): int;
    public function getById(int $userId): ?User;
    public function get(string $nickName): ?User;
    public function getAll(): ?array;
    public function saveAvatarPath(int $userId, string $avatarPath): bool;
    public function delete(int $userId): void;
    public function update(User $user): void;
    public function updateRoomId(int $userId, int $roomId): void;
    public function updateReadyState(int $userId, bool $isReady): void;
}
