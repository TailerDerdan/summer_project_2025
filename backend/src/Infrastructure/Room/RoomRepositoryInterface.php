<?php
declare (strict_types= 1);

namespace App\Infrastructure\Room;

use App\Entity\Room\Room;

interface RoomRepositoryInterface {
    public function create(Room $room): ?int;
    public function get(int $roomId): ?Room;

    public function getAll(): ?array;
    public function delete(int $roomId): void;
}
