<?php
declare (strict_types= 1);

namespace App\Infrastructure\Map;

use App\Entity\Map\Map;

interface MapRepositoryInterface {
    public function save(Map $map): ?int;
    public function get(string $name): ?Map;
    public function getAll(): ?array;
}
