<?php
declare (strict_types= 1);

namespace App\Infrastructure\Room;

use App\Entity\Room\Room;

interface RoomRepositoryInterface {
    public function create(Room $room): ?int;
    public function get(int $roomId): ?Room;

    public function getAll(): ?array;
    public function delete(int $roomId): void;
    public function addUserInRoom(int $userId, int $roomId): void;
    public function removeUserFromRoom(int $userId, int $roomId): void;
}
