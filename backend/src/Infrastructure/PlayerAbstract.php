<?php
declare (strict_types= 1);

namespace App\Infrastructure;

use App\Entity\PlayerInterface;
use App\Entity\WeaponInterface;

abstract class PlayerAbstract implements PlayerInterface {
    protected int $id;
    protected string $name;
    protected int $health;
    protected WeaponInterface $currentWeapon;
    protected array $weapons = [];
    protected int $currentSpeed;

    public function __construct(int $id, string $name, int $health, int $baseSpeed) {
        $this->id = $id;
        $this->name = $name;
        $this->health = $health;
        $this->currentSpeed = $baseSpeed;
        $this->currentWeapon = new SniperRifle(60);
    }

    public function getId(): int {
        return $this->id;
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
    public function getCurrentWeapon(): WeaponInterface {
        return $this->currentWeapon;
    }

    public function takeDamage(): void {
        $currentHealth = $this->health -= $this->currentWeapon->getDamage();
        $this->health = max(0, $currentHealth);
    }
}