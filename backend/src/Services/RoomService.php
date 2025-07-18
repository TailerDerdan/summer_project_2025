<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\Room\Room;
use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\Room\RoomRepositoryInterface;

class RoomService implements RoomServiceInterface {
    public function __construct(private RoomRepositoryInterface $roomRepository) {
    }
    public function create(array $roomData): ?int {
        $room = new Room(
            null,
            $roomData['userId'],
            $roomData['name'],
            $roomData['gamemode'],
            $roomData['isOpen'] ?? true,
            false,
            new \DateTime(),
        );
        $roomId = $this->roomRepository->create($room);
        return $roomId;
    }
    public function get(int $roomId): ?Room {
        return $this->roomRepository->get($roomId);
    }

    public function createPlayRoom($roomParams): int
    {
        // TODO: Implement createPlayRoom() method.
        return $this->roomRepository->create($roomParams);
    }

    public function updatePlayRoom($roomParams, $roomId): int
    {
        // TODO: Implement updatePlayRoom() method.
        return 1;
    }

    public function deletePlayRoom($roomId): void
    {
        // TODO: Implement deletePlayRoom() method.
    }

    public function getAll(): ?array
    {
        return $this->roomRepository->getAll();
    }

    public function addUserInRoom(int $userId, int $roomId): void
    {
        // TODO: Implement addUserInRoom() method.
    }

    public function removeUserFromRoom(int $userId): void
    {
        // TODO: Implement removeUserFromRoom() method.
    }

    public function getRoomById($roomId): ?Room
    {
        // TODO: Implement getRoomById() method.
    }
}
