<?php
declare (strict_types= 1);

namespace App\Repository;

use App\Entity\Room\PlayRoom;
use App\Entity\User\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use App\Infrastructure\Room\RoomRepositoryInterface;

class RoomRepository extends ServiceEntityRepository implements RoomRepositoryInterface {
    private EntityRepository $userRepository;
    public function __construct(private EntityManagerInterface $entityManager) {
        $this->userRepository = $entityManager->getRepository(User::class);
    }

    public function create(array $playRoom): int {
        return 1;
    }
    //     $room = new PlayRoom(
    //         $playRoom['userId'] ?? null,
    //         $playRoom['roomId'] ?? null,
    //         $playRoom['nickName'],
    //         $playRoom,
    //         $playRoom['avatarPath'] ?? null,
    //         0, 0, 0, 0,
    //     );
    //     $this->entityManager->contains($user);
    //     $this->entityManager->persist($user);
    //     $this->entityManager->flush();
    //     return 1;
    // }
    public function join(string $nickName): void {
    }
    //     $this->entityManager->persist($nickName);
    // }
}