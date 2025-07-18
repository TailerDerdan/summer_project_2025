<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\Room\Room;
use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\Room\RoomRepositoryInterface;

class RoomService implements RoomServiceInterface {
    private const DEFAULT_VALUE_FOR_UNREACHABLE_PARAMS = 0;
    public function __construct(private RoomRepositoryInterface $roomRepository) {
    }
    public function create(array $roomData): ?int {
        $isOpen = ($roomData['room_open'] ?? 'open') === 'open';
        $room = new Room(
            null,
            $roomData['user_id'],
            $roomData['room_name'],
            $roomData['room_playmode'],
            $isOpen,
            false,
            new \DateTime(),
        );
        $roomId = $this->roomRepository->create($room);
        return $roomId;
    }

    public function update(int $roomId, array $roomData): ?int {
        $isOpen = ($roomData['room_open'] ?? 'open') === 'open';
        $room = new Room(
            null,
            DEFAULT_VALUE_FOR_UNREACHABLE_PARAMS,
            $roomData['room_name'],
            $roomData['room_playmode'],
            $isOpen,
            $roomData['room_running'] ?? false,
            DEFAULT_VALUE_FOR_UNREACHABLE_PARAMS
        );
        $roomId = $this->roomRepository->update($roomId, $room);
        return $roomId;
    }

    public function delete(int $roomId): ?int {
        $roomId = $this->roomRepository->deleteById($roomId);
        return $roomId;
    }

    public function get(int $roomId): ?Room {
        return $this->roomRepository->get($roomId);
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
