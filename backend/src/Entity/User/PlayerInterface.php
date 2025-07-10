<?php
declare (strict_types= 1);

namespace App\Entity\User;

use App\Entity\Weapons\Weapon;

interface PlayerInterface {
    public function getId(): int;
    public function getRoomId(): int;
    public function getName(): string;
    public function getHealth(): int;
    public function getCurrentSpeed(): int;
    public function getCurrentWeapon(): Weapon;
    public function takeDamage(): void;
    public function switchWeapon(string $weaponType): void;
    public function fire(): void;
    public function reload(): void;
}