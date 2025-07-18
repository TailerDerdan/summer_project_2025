<?php
declare (strict_types= 1);

namespace App\Infrastructure\Room;

use App\Entity\Room\Room;

interface RoomServiceInterface {
    public function create(array $roomData): ?int;
    public function get(int $roomId): ?Room;
    public function createPlayRoom($roomParams): int;
    public function updatePlayRoom($roomParams, $roomId): int;
    public function deletePlayRoom($roomId): void;
    public function getRoomById($roomId): ?Room;
    public function getAll(): ?array;
    public function addUserInRoom(int $userId, int $roomId): void;
    public function removeUserFromRoom(int $userId): void;
}
