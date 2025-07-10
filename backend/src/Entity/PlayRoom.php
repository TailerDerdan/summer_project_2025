<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\User;

//isOpen: t/f
//isRunning: t/f

class PlayRoom
{
    private const MaxSize = 6;
    private ?int $id;
    private string $name;
    private string $description;
    private array $users;
    private bool $isOpen;
    private bool $isRunning;

    public function __construct(?int $id, string $name, string $description, array $users, bool $isOpen, bool $isRunning)
    {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->users = $users;
        $this->isOpen = $isOpen;
        $this->isRunning = $isRunning;
    }

    public function getId(): ?int
    {
        return $this->id;
    }
    public function getName(): string
    {
        return $this->name;
    }
    public function getDescription(): string
    {
        return $this->description;
    }
    public function getUsers(): array
    {
        return $this->users;
    }
    public function isOpen(): bool
    {
        return $this->isOpen;
    }
    public function isRunning(): bool
    {
        return $this->isRunning;
    }

    public function getRunningRoom(PlayRoom $playRoom): PlayRoom
    {
        if ($this->isRunning)
        {
            return $playRoom;
        }
        else
        {
            $result = new PlayRoom(
                $playRoom->getId(),
                $playRoom->getName(),
                $playRoom->getDescription(),
                $playRoom->getUsers(),
                false,
                true
            );
            return $result;
        }
    }

    public function getRoomWithUser(User $user): PlayRoom
    {
        $users = $this->getUsers();
        if ((count($users) <= self::MaxSize - 1) && ($this->isOpen() == true))
        {
            $users[] = $user;
        }
        else
        {
            throw new \RuntimeException("Невозможно присоединиться к комнате");
        }
        $result = new PlayRoom(
            $this->getId(),
            $this->getName(),
            $this->getDescription(),
            $users,
            $this->isOpen(),
            $this->isRunning()
        );
        return $result;
    }

    public function getRoomWithoutUser(User $requiredUser): PlayRoom
    {
        $users = $this->getUsers();
        /**
         * @var $updatedUsers = array [User]
         */
        $updatedUsers = [];
        foreach ($users as $user)
        {
            if ($user->getUserId() !== $requiredUser->getUserId())
            {
                $updatedUsers[] = $user;
            }
        }
        $result = new PlayRoom(
            $this->getId(),
            $this->getName(),
            $this->getDescription(),
            $updatedUsers,
            $this->isOpen(),
            $this->isRunning()
        );
        return $result;
    }
}
