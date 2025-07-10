<?php
declare (strict_types= 1);

namespace App\Infrastructure;
use App\Entity\WeaponInterface;

abstract class Weapon implements WeaponInterface {
    protected string $type;
    protected int $damage;
    protected int $fireRange;
    protected int $weight;
    protected int $speedBullet;
    protected float $timeBetweenBullet;
    protected int $ammoCapacity;
    private int $currentAmmo;
    protected int $totalAmmo;
    protected float $timeReload;

    private bool $isReload = false;
    private float $startReload = 0;
    private float $lastFireTime = 0;

    public function __construct(int $ammo) {
        $this->currentAmmo = $this->ammoCapacity;
        $this->totalAmmo = $ammo;
    }

    public function getType(): string {
        return $this->type;
    }
    public function getDamage(): int {
        return $this->damage;
    }
    public function getWeight(): int {
        return $this->damage;
    }
    public function getSpeedBullet(): int {
        return $this->speedBullet;
    }
    public function getFireRange(): int {
        return $this->fireRange;
    }
    public function getTimeBetweenBullet(): float {
        return $this->timeBetweenBullet;
    }
    public function getTimeReload(): float {
        return $this->timeReload;
    }
    public function getAmmoCapacity(): int {
        return $this->ammoCapacity;
    }
    public function getTotalAmmo(): int {
        return $this->totalAmmo;
    }
    public function getCurrentAmmo(): int {
        return $this->currentAmmo;
    }
    public function fire(): void {
        if (!$this->canFire()) {
            throw new \RuntimeException("Идет перезарядка");
        }
        $this->currentAmmo--;
        $this->lastFireTime = microtime(true);
    }
    public function reload(): void {
        if ($this->totalAmmo == 0 || $this->currentAmmo === $this->ammoCapacity) {
            return;
        }
        $this->startReload = microtime(true);
        $this->isReload = true;
    }
    public function canFire(): bool {
        $now = microtime(true);

        if ($this->isReload) {
            if ($now - $this->startReload >= $this->timeReload) {
                $this->finishReload();
            } else {
                return false;
            }
        }

        if ($this->currentAmmo <= 0) {
            return false;
        }

        $minReloadTime = 1 / $this->timeBetweenBullet;
        return ($now - $this->lastFireTime) >= $minReloadTime;
    }

    private function finishReload(): void {
        $needAmmo = $this->ammoCapacity - $this->currentAmmo;
        $addAmmo = min($needAmmo, $this->totalAmmo);

        $this->totalAmmo -= $needAmmo;
        $this->currentAmmo += $addAmmo;
        $this->isReload = false;
    }
}
