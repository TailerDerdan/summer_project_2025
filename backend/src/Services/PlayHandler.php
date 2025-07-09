<?php
declare (strict_types= 1);

namespace App\Services;

use App\Infrastructure\Player;

class PlayHandler {
    public function startAttack(Player $attacker, $defender): void {
        $weapon = $attacker->getCurrentWeapons();
        if (!$weapon->canFire()) {
            return;
        }
        $attacker->fire();
        $defender->takeDamage($weapon->getDamage());
    }
}