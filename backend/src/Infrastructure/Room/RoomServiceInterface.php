<?php
declare (strict_types= 1);

namespace App\Infrastructure\Room;

use App\Entity\Room\Room;

interface RoomServiceInterface {
    public function create(array $roomData): ?int;
    public function update(int $roomId, array $roomData): ?int;
    public function delete(int $roomId, int $userId): ?int;
    public function get(int $roomId): ?Room;
    public function getRoomById($roomId): ?Room;
    public function getAll(): ?array;
    public function addUserInRoom(int $userId, int $roomId): void;
    public function removeUserFromRoom(int $userId): void;
}
