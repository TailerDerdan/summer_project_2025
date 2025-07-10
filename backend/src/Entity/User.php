<?php

declare(strict_types=1);

namespace App\Entity;

class User
{
    private ?int $userId;
    private ?int $roomId;
    private string $nickName;
    private string $password;
    private string $avatarPath;

    public function __construct(?int $userId, ?int $roomId, string $nickName, string $password, string $avatarPath)
    {
        $this->userId = $userId;
        $this->roomId = $roomId;
        $this->nickName = $nickName;
        $this->password = $password;
        $this->avatarPath = $avatarPath;
    }

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
    public function getAvatarPath(): string
    {
        return $this->avatarPath;
    }
}
