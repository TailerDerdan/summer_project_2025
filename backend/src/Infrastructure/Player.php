<?php
declare (strict_types= 1);

namespace App\Infrastructure;

use App\Entity\WeaponInterface;

class Player extends PlayerAbstract {
    private const BaseSpeed = 100;
    private int $id;
    private string $name;
    private int $health;
    private WeaponInterface $currentWeapon;
    private array $weapons = [];
    private int $currentSpeed;

    public function __construct(int $id, string $name, int $health) {
        parent::__construct($id, $name, $health, self::BaseSpeed);
    }

    public function addWeapon(WeaponInterface $weapon): void {
        $this->weapons[$weapon->getType()] = $weapon;
    }

    public function changeSpeed(int $speed): void {
        $this->currentSpeed = self::BaseSpeed - $this->currentWeapon->getWeight();
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

    public function takeDamage(): void {
        $currentHealth = $this->health -= $this->currentWeapon->getDamage();
        if ($currentHealth < 0) {
            $this->health = 0;
        }
    }

    public function reload(): void {
        $this->currentWeapon->reload();
    }

    public function getCurrentWeapons(): WeaponInterface {
        return $this->currentWeapon;
    }
}