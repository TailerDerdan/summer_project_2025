<?php
declare (strict_types= 1);

namespace App\Services;

use App\Entity\Room\PlayRoom;
use App\Infrastructure\Room\RoomServiceInterface;
use App\Infrastructure\Room\RoomRepositoryInterface;

class RoomService implements RoomServiceInterface {
    public function __construct(private RoomRepositoryInterface $roomRepository) {
    }
    public function create(array $playRoom): ?int {
        $roomId = $this->roomRepository->create($playRoom);
        return $roomId;
    }
    public function join(string $nickName): void {
        $this->roomRepository->join($nickName);
    }
}