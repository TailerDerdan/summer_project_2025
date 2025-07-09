<?php
declare (strict_types= 1);
namespace App\Infrastructure;

class WeaponFactory {
    public static function create(string $type, int $ammo): Weapon {
        return match ($type) {
            "sniper rifle" => new SniperRifle($ammo),
            default => new SniperRifle($ammo),
        };
    }
}