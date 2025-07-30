<?php
declare (strict_types= 1);

namespace App\Repository;

use App\Entity\Room\Room;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use App\Infrastructure\Room\RoomRepositoryInterface;
use Doctrine\Persistence\ManagerRegistry;

class RoomRepository extends ServiceEntityRepository implements RoomRepositoryInterface {
    public function __construct(ManagerRegistry $managerRegistry) {
        parent::__construct($managerRegistry, Room::class);
    }

    public function create(Room $room): int {
        $this->getEntityManager()->persist($room);
        $this->getEntityManager()->flush();
        return $room->getId();
    }
    public function get(int $roomId): ?Room {
        return $this->find($roomId);
    }
    public function getAll(): ?array {
        return $this->findAll();
    }

    public function delete(int $roomId): void {
        $room = $this->find($roomId);
        if ($room) {
            $this->getEntityManager()->remove($room);
            $this->getEntityManager()->flush();
        }
    }
    public function addUserInRoom(int $userId, int $roomId): void {
        $room = $this->find($roomId);
        if ($room) {
            $room->incPlayersCount();
            $this->getEntityManager()->persist($room);
            $this->getEntityManager()->flush();
        }
    }
    public function removeUserFromRoom(int $userId, int $roomId): void {
        $room = $this->find($roomId);
        if ($room) {
            $room->decPlayersCount();
            $this->getEntityManager()->persist($room);
            $this->getEntityManager()->flush();
        }
    }
}
