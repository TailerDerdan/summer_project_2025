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

    public function update(int $roomId, Room $newRoom): int
    {
        $room = $this->find($roomId);
        if (!$room) {
            return throw new \Exception('Room not found');
        }
        else {
            $room->setName($newRoom->getName());
            $room->setGamemode($newRoom->getGamemode());
            $room->setOpen($newRoom->isOpen());
            $room->setRunning($newRoom->isRunning());
            $this->getEntityManager->flush();
            return $room->getId();
        }
    }

    public function deleteById(int $roomId): int
    {
        $room = $this->find($roomId);
        if ($room) {
            $this->getEntityManager()->remove($room);
            $this->getEntityManager()->flush();
            return $room->getId();
        }
        else {
            return throw new \Exception('Room not found');
        }
    }

    public function get(int $roomId): ?Room {
        return $this->find($roomId);
    }
    public function getAll(): ?array {
        return $this->findAll();
    }
}
