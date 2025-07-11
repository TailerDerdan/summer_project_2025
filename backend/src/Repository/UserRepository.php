<?php
declare (strict_types= 1);

namespace App\Repository;

use App\Entity\User\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use App\Infrastructure\User\UserRepositoryInterface;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository implements UserRepositoryInterface {
    public function __construct(ManagerRegistry $managerRegistry) {
        parent::__construct($managerRegistry, User::class);
    }

    public function save(array $userData): int {
        $passwordHash = password_hash($userData['password'] , PASSWORD_DEFAULT);
        $user = new User(
            $userData['userId'] ?? null,
            $userData['roomId'] ?? null,
            $userData['nickName'],
            $passwordHash,
            $userData['avatarPath'] ?? null,
        );
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
        return $user->getUserId();
    }
    public function getById(int $userId): ?User {
        return $this->find($userId);
    }
    public function get(string $nickName): ?User {
        return $this->findOneBy(['nickName' => $nickName]);
    }
    public function saveAvatarPath(int $userId, string $avatarPath): bool {
        return true;
    }
    public function getAll(): array {
        return [];
    }
    public function delete(int $userId): void {

    }
    public function update(User $user): void {

    }
}