<?php

declare(strict_types=1);

namespace App\Entity;

//isOpen: t/f
//isRunning: t/f

class PlayRoom
{
    private const MaxSize = 6;

    private ?int $id;
    private string $name;
    private string $gamemode;
    private bool $isOpen;
    private bool $isRunning;
    private string $timeCreate;
    private int $hostId;

    public function __construct(
        ?int $id,
        string $name,
        string $gamemode,
        bool $isOpen,
        bool $isRunning,
        string $timeCreate,
        int $hostId)
    {
        $this->id = $id;
        $this->name = $name;
        $this->gamemode = $gamemode;
        $this->isOpen = $isOpen;
        $this->isRunning = $isRunning;
        $this->timeCreate = $timeCreate;
        $this->hostId = $hostId;
    }

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
        return $this->isRunning;
    }
    public function getTimeCreate(): string
    {
        return $this->timeCreate;
    }
    public function getHostId(): int
    {
        return $this->hostId;
    }
}
