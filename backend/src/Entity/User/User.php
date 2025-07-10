<?php
declare (strict_types=1);

namespace App\Entity\User;

class User {
    public function __construct (
        private ?int $userId,
        private ?int $roomId,
        private string $nickName,
        private string $password,
        private ?string $avatarPath
    ) {}

    public function getUserId(): ?int
    {
        return $this->userId;
    }
    public function getRoomId(): ?int
    {
        return $this->roomId;
    }
    public function getNickName(): string
    {
        return $this->nickName;
    }
    public function getPassword(): string
    {
        return $this->password;
    }
    public function getAvatarPath(): ?string
    {
        return $this->avatarPath;
    }
}
