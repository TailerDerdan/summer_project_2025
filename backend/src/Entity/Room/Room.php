<?php
declare(strict_types=1);

namespace App\Entity\Room;

class Room
{
    private const MaxSize = 6;

    public function __construct(
        private ?int $id,
        private int $hostId,
        private string $name,
        private string $gamemode,
        private bool $isOpen,
        private bool $isRun,
        private \DateTime $timeCreate,
    ) {}

    public function getId(): ?int
    {
        return $this->id;
    }
    public function getName(): string
    {
        return $this->name;
    }
    public function getGamemode(): string
    {
        return $this->gamemode;
    }
    public function isOpen(): bool
    {
        return $this->isOpen;
    }
    public function isRunning(): bool
    {
        return $this->isRun;
    }
    public function getTimeCreate(): \DateTime
    {
        return $this->timeCreate;
    }
    public function getHostId(): int
    {
        return $this->hostId;
    }


    public function setName(string $newName): void
    {
        $this->name = $newName;
    }

    public function setGamemode(string $newGamemode): void
    {
        $this->gamemode = $newGamemode;
    }

    public function setOpen(bool $newOpenState): void
    {
        $this->isOpen = $newOpenState;
    }

    public function setRunning(bool $newRunningState): void
    {
        $this->isRun = $newRunningState;
    }
    public function setHostId(int $newHostId): void
    {
        $this->hostId = $newHostId;
    }
}
