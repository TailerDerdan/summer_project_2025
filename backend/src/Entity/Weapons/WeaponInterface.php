<?php
declare (strict_types= 1);

namespace App\Entity\Weapons;

interface WeaponInterface {
    public function getType(): string;
    public function getDamage(): int;
    public function getWeight(): int;
    public function getSpeedBullet(): int;
    public function getFireRange(): int;
    public function getTimeBetweenBullet(): float;
    public function getTimeReload(): float;
    public function getAmmoCapacity(): int;
    public function getCurrentAmmo(): int;
    public function getTotalAmmo(): int;
    public function fire(): void;
    public function reload(): void;
    public function canFire(): bool;
}