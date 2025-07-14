<?php

declare (strict_types= 1);

namespace App\Services;

use App\Entity\Room\PlayRoom;
use App\Entity\User\Player;
use App\Entity\User\User;

interface PlayRoomServiceInterface {
    public function createPlayRoom($roomParams): int;
    public function updatePlayRoom($roomParams, $roomId): int;
    public function deletePlayRoom($roomId): void;
    public function getRoomById($roomId): ?PlayRoom;
    public function getAllRooms(): ?array;
    public function addUserInRoom(int $userId, int $roomId): void;
    public function removeUserFromRoom(int $userId): void;

}
