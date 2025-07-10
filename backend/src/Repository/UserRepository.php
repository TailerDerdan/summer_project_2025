<?php
declare (strict_types= 1);

namespace App\Repository;

use App\Entity\User\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use App\Infrastructure\User\UserRepositoryInterface;

class UserRepository extends ServiceEntityRepository implements UserRepositoryInterface {
    private EntityRepository $userRepository;
    public function __construct(private EntityManagerInterface $entityManager) {
        $this->userRepository = $entityManager->getRepository(User::class);
    }

    public function save(array $userData): int {
        $user = new User(
            $userData['userId'] ?? null,
            $userData['roomId'] ?? null,
            $userData['nickName'],
            $userData['password'],
            $userData['avatarPath'] ?? null
        );
        $this->entityManager->contains($user);
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        return $user->getUserId();
    }
    public function getById(int $userId): ?User {
        return $this->userRepository->find($userId);
    }
    public function get(string $nickName): ?User {
        return $this->userRepository->findOneBy(['nickName' => $nickName]);
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