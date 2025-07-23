<?php
declare (strict_types=1);

namespace App\Entity\User;

use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User implements UserInterface, PasswordAuthenticatedUserInterface {
    public function __construct(
        private ?int $userId,
        private ?int $roomId,
        private string $nickName,
        private string $password,
        private ?string $avatarPath,
        private int $countGames = 0,
        private int $countWins = 0,
        private int $countKills = 0,
        private int $countDeaths = 0,
    ) {
    }

    public function getRoles(): array{
        return ['ROLE_USER'];
    }
    public function eraseCredentials(): void {}
    public function getUserIdentifier(): string{
        return $this->nickName;
    }
    public function getUserId(): ?int {
        return $this->userId;
    }
    public function getRoomId(): ?int {
        return $this->roomId;
    }
    public function getNickName(): string {
        return $this->nickName;
    }
    public function getPassword(): string {
        return $this->password;
    }
    public function getAvatarPath(): ?string {
        return $this->avatarPath;
    }
    public function getCountGames(): int {
        return $this->countGames;
    }
    public function getCountWins(): int {
        return $this->countWins;
    }
    public function getCountKills(): int {
        return $this->countKills;
    }
    public function getCountDeaths(): int {
        return $this->countDeaths;
    }
    public function setPassword(string $password): void {
        $this->password = $password;
    }

    public function setRoomId(?int $roomId): void {
        $this->roomId = $roomId;
    }
}
