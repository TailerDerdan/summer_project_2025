<?php
declare (strict_types= 1);

namespace App\Infrastructure;


class SniperRifle extends Weapon {
    public function __construct(int $ammo) {
        $this->type = "sniper rifle";
        $this->damage = 5;
        $this->weight = 5;
        $this->speedBullet = 5;
        $this->fireRange = 100;
        $this->timeBetweenBullet = 0.5;
        $this->ammoCapacity = 10;
        $this->timeReload = 2.5;
        $this->totalAmmo = 30;

        parent::__construct($ammo);
    }

    public function fire(): void {
    }
}