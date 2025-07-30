<?php
declare(strict_types=1);

namespace App\Services;

use App\Entity\Map\Map;
use App\Infrastructure\Map\MapRepositoryInterface;

class MapService
{
    public function __construct(
        private MapRepositoryInterface $mapRepository
    ) {}

    public function save(string $name): ?int {
        $map = new Map(
            null,
            $name,
        );
        $this->mapRepository->save($map);
        return null;
    }
    public function get(string $name): ?Map
    {
        return $this->mapRepository->get($name);
    }
    public function getAll(): ?array {
        return $this->mapRepository->getAll();
    }
}
