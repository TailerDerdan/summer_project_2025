<?php
declare (strict_types= 1);

namespace App\Infrastructure\Room;

use App\Entity\Room\PlayRoom;

interface RoomRepositoryInterface {
    public function create(array $playRoom): ?int;
    public function join(string $nickName): void;
}