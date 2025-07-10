<?php
declare (strict_types= 1);

namespace App\Entity\Weapons;

use App\Entity\Weapons\WeaponInterface;

class Weapon implements WeaponInterface {
    private bool $isReload = false;
    private float $startReload = 0;
    private float $lastFireTime = 0;

    public function __construct(
        private string $type,
        private int $damage,
        private int $fireRange,
        private int $weight,
        private int $speedBullet,
        private float $timeBetweenBullet,
        private int $ammoCapacity,
        private int $currentAmmo,
        private int $totalAmmo,
        private float $timeReload,
    ) {}

    public function getType(): string { 
        return $this->type; 
    }
    public function getDamage(): int { 
        return $this->damage; 
    }
    public function getFireRange(): int { 
        return $this->fireRange; 
    }
    public function getWeight(): int {
        return $this->weight;
    }
    public function getSpeedBullet(): int {
        return $this->speedBullet;
    }
    public function getTimeBetweenBullet(): float {
        return $this->timeBetweenBullet;
    }
    public function getAmmoCapacity(): int {
        return $this->ammoCapacity;
    }
    public function getCurrentAmmo(): int {
        return $this->currentAmmo;
    }
    public function getTotalAmmo(): int {
        return $this->totalAmmo;
    }
    public function getTimeReload(): float {
        return $this->timeReload;
    }

    public function fire(): void {

    }
    public function reload(): void {

    }
    public function canFire(): bool {
        return true;
    }
}