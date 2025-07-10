<?php
declare (strict_types= 1);
namespace App\Services;

use App\Entity\Weapons\Weapon;

class WeaponService {
    public function __construct() {
    }
    public static function create(string $type): Weapon {
        return match ($type) {
            "sniper rifle" => new Weapon($type,10,5,20,3, 0.5, 10, 10, 20, 1.5),
            "shotgun" => new Weapon($type,10,5,20,3, 0.5, 10, 10, 20, 1.5),
            "pistol" => new Weapon($type,10,5,20,3, 0.5, 10, 10, 20, 1.5),
            default => new Weapon("pistol",10,5,20,3, 0.5, 10, 10, 20, 1.5),
        };
    }
}