<?php
declare(strict_types=1);
namespace App\Repository;

use App\Entity\Map\Map;
use App\Infrastructure\Map\MapRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MapRepository extends ServiceEntityRepository implements MapRepositoryInterface
{
    public function __construct(ManagerRegistry $managerRegistry) {
        parent::__construct($managerRegistry, Map::class);
    }
    public function save(Map $map): ?int {
        $this->getEntityManager()->persist($map);
        $this->getEntityManager()->flush();
        return $map->getId();
    }
    public function get(string $name): ?Map {
        return $this->findOneBy(['name' => $name]);
    }
    public function getAll(): ?array {
        return $this->findAll();
    }
}
