<?php
declare (strict_types= 1);

namespace App\Security;

use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class SecurityUser implements UserInterface, PasswordAuthenticatedUserInterface {
    public function __construct(
        private ?int $userId,
        private string $nickName,
        private string $password,
        private bool $isReady,
//        private array $roles,
        private ?int $roomId,
        private ?string $avatarPath,
        private int $countGames,
        private int $countWins,
        private int $countKills,
        private int $countDeaths,
    ) {}
    public function getRoles(): array{
        return ['ROLE_USER'];
    }
    public function getUserIdentifier(): string{
        return $this->nickName;
    }
    public function getUserId(): ?int {
        return $this->userId;
    }
    public function getRoomId(): ?int {
        return $this->roomId;
    }
    private function getIsReady(): bool {
        return $this->isReady;
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
    private function getCountGames(): int {
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
    public function eraseCredentials(): void {}
}
