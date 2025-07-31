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
            $roomData['playersCount'],
            $roomData['maxPlayers'],
            $roomData['userId'],
            $roomData['name'],
            $roomData['gamemode'],
            $roomData['isOpen'] ?? true,
            new \DateTime(),
        );
        $roomId = $this->roomRepository->create($room);
        return $roomId;
    }
    public function get(int $roomId): ?Room {
        return $this->roomRepository->get($roomId);
    }

    public function update($roomParams, $roomId): int
    {
        // TODO: Implement updatePlayRoom() method.
        return 1;
    }

    public function delete(int $roomId): void
    {
        $this->roomRepository->delete($roomId);
    }

    public function getAll(): ?array
    {
        return $this->roomRepository->getAll();
    }

    public function addUserInRoom(int $userId, int $roomId): void
    {
        $this->roomRepository->addUserInRoom($userId, $roomId);
    }

    public function removeUserFromRoom(int $userId, int $roomId): void
    {
        $this->roomRepository->removeUserFromRoom($userId, $roomId);
    }
}
