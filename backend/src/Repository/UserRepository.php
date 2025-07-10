<?php
declare (strict_types= 1);

namespace App\Repository;

use App\Entity\User\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

class UserRepository extends ServiceEntityRepository implements UserRepositoryInterface {
    private EntityManagerInterface $entityManagerInterface;
    private EntityRepository $userRepository;
    public function __construct(EntityManagerInterface $entityManagerInterface) {
        $this->entityManagerInterface = $entityManagerInterface;
        $this->userRepository = $entityManagerInterface->getRepository(User::class);
    }
    public function saveUser(User $user): int {
        return 1;
    }
    public function findUser(int $userId): ?User {

    }
    public function saveAvatarPath(int $userId, string $avatarPath): bool {
        return true;
    }
    public function getUsers(): array {
        return [];
    }
    public function deleteUser(int $userId): void {

    }
    public function updateUser(User $user): void {

    }
}