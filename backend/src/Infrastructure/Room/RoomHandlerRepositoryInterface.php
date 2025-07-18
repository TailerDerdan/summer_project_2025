<?php

declare (strict_types=1);

namespace App\Infrastructure\Room;

use App\Entity\Room\PlayRoom;

interface RoomHandlerRepositoryInterface
{
    public function getAllUsersByRoomId(int $playRoomId): ?array;
    public function saveUserInRoomById(int $userId, int $playRoomId): void;
    public function getRoomIdByUserId(int $userId): ?int;
    public function getHostIdByRoomId(int $playRoomId): int;
    public function deleteUserFromRoom(int $userId): void;
}
