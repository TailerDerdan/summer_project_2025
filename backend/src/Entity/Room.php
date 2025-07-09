<?php
declare (strict_types= 1);

namespace App\Entity;

use DateTimeImmutable;

class Room {
    public function __construct(
        private int $id,
        private string $name,
        private int $maxPeople,
        private \DateTimeImmutable $creatAt,
        private \DateTimeImmutable $startAt,
    ) {}
    public function getId(): int {
        return $this->id;
    }
    public function getName(): string {
        return $this->name;
    }
    public function getMaxPeople(): int {
        return $this->maxPeople;
    }
    public function getcreatAt(): \DateTimeImmutable {
        return $this->creatAt;
    }
    public function getStartAt(): \DateTimeImmutable {
        return $this->startAt;
    }
}