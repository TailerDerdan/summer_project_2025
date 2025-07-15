<?php
declare (strict_types= 1);

namespace App\Repository;

use App\Entity\Room\Room;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
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
}
