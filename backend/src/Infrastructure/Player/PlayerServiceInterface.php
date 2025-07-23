<?php
declare (strict_types= 1);

namespace App\Infrastructure\Player;

use App\Entity\Player\Player;

interface PlayerServiceInterface {
    public function startAttack(Player $attacker, $defender): void;
}