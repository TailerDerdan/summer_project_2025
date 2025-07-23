<?php
declare (strict_types= 1);

namespace App\Infrastructure\Weapon;

use App\Infrastructure\Weapon\WeaponInterface;

interface WeaponServiceInterface {
    public function create(string $name): WeaponInterface;
}