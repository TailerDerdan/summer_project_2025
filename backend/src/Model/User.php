<?php

declare(strict_types=1);

namespace App\Model;

class User
{
    private ?int $userId;
    private string $nickName;
    private string $password;
    private string $avatarPath;

    public function __construct(?int $userId, string $nickName, string $password, string $avatarPath)
    {
        $this->userId = $userId;
        $this->nickName = $nickName;
        $this->password = $password;
        $this->avatarPath = $avatarPath;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
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