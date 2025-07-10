<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\User\Player;

class PlayerService implements PlayerServiceInterface {
    public function startAttack(Player $attacker, $defender): void {
        $weapon = $attacker->getCurrentWeapons();
        if (!$weapon->canFire()) {
            return;
        }
        $attacker->fire();
        $defender->takeDamage($weapon->getDamage());
    }
}