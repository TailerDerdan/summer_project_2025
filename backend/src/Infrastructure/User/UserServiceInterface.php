<?php
declare (strict_types= 1);

namespace App\Infrastructure\User;

use App\Entity\User\User;

interface UserServiceInterface {
    public function getById(int $userId): ?User;
    public function get(string $nickName): ?User;
    public function save(array $user): int;
}