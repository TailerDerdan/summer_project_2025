<?php
declare (strict_types= 1);

namespace App\Infrastructure\User;

use App\Entity\User\User;

interface UserServiceInterface {
    public function getById(int $userId): ?User;
    public function get(string $nickName): ?User;
    public function getAll(): ?array;
    public function save(array $user): int;
    public function updateRoomId(int $userId, int $roomId): void;
    public function updateReadyState(int $userId, bool $isReady): void;
}
