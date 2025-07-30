<?php
declare (strict_types= 1);

namespace App\Infrastructure\Map;

use App\Entity\Map\Map;

interface MapServiceInterface {
    public function save(string $name): ?int;
    public function get(string $name): ?Map;
    public function getAll(): ?array;
}
