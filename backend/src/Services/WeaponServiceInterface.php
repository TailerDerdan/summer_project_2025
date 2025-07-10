<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\Weapons\Weapon;

interface WeaponServiceInterface {
    public function create(string $name): Weapon;
}