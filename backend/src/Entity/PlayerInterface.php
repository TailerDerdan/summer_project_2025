<?php
declare (strict_types= 1);

namespace App\Entity;

interface PlayerInterface {
    public function getId(): int;
    public function getName(): string;
    public function getHealth(): int;
    public function getCurrentSpeed(): int;
    public function getCurrentWeapon(): WeaponInterface;
    public function takeDamage(): void;
    public function fire(): void;

    public function reload(): void;
}