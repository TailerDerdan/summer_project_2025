<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\User\Player;

interface PlayerServiceInterface {
    public function startAttack(Player $attacker, $defender): void;
}