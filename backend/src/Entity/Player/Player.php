<?php
declare (strict_types= 1);

namespace App\Entity\Player;

use App\Entity\Weapon\Weapon;
use App\Infrastructure\Player\PlayerInterface;

class Player implements PlayerInterface {
    private const BASE_SPEED = 100;

    //TODO добавить скорость игроку 
    public function __construct(
        private int $id, 
        private int $roomId,
        private string $name, 
        private int $health, 
        private Weapon $currentWeapon,
        private array $weapons = [],
        private int $currentSpeed
    ) {}

    public function getId(): int { 
        return $this->id; 
    }
    public function getRoomId(): int { 
        return $this->roomId; 
    }
    public function getName(): string { 
        return $this->name; 
    }
    public function getHealth(): int { 
        return $this->health; 
    }
    public function getCurrentSpeed(): int { 
        return $this->currentSpeed; 
    }
    public function getCurrentWeapon(): Weapon { 
        return $this->currentWeapon; 
    }

    public function takeDamage(): void {
        $currentHealth = $this->health -= $this->currentWeapon->getDamage();
        $this->health = max(0, $currentHealth);
    }
        public function addWeapon(Weapon $weapon): void {
        $this->weapons[$weapon->getType()] = $weapon;
    }

    public function changeSpeed(int $speed): void {
        $this->currentSpeed = self::BASE_SPEED - $this->currentWeapon->getWeight();
    }

    public function switchWeapon(string $weaponType): void {
        if (!isset($this->weapons[$weaponType])) {
            return;
        }
        $this->currentWeapon = $this->weapons[$weaponType];
    }

    public function fire(): void {
        $this->currentWeapon->fire();
    }

    public function reload(): void {
        $this->currentWeapon->reload();
    }

    public function getCurrentWeapons(): Weapon {
        return $this->currentWeapon;
    }
}