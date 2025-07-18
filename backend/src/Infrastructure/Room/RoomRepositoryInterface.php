<?php
declare (strict_types= 1);

namespace App\Infrastructure\Room;

use App\Entity\Room\Room;

interface RoomRepositoryInterface {
    public function create(Room $room): ?int;
    public function update(int $roomId, Room $newRoom): ?int;
    public function deleteById(int $roomId): ?int;
    public function getHostIdById(int $roomId): int;
    public function get(int $roomId): ?Room;
    public function getAll(): ?array;
}
