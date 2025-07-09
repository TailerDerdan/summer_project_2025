<?php

declare(strict_types=1);

namespace App\Model;

use App\Model\User;

//isOpen: t/f
//isRunning: t/f

class PlayRoom
{
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
                $playRoom->false,
                $playRoom->true
            );
            return $result;
        }
    }

    public function getRoomWithUser(PlayRoom $playRoom, User $user): PlayRoom
    {
        $users = $playRoom->getUsers();
        if ((count($users) <= 6) && ($playRoom->isOpen() == true))
        {
            $users[] = $user;
        }
//        else
//        {
//            //
//        }
        $result = new PlayRoom(
            $playRoom->getId(),
            $playRoom->getName(),
            $playRoom->getDescription(),
            $playRoom->$users,
            $playRoom->isOpen(),
            $playRoom->isRunning()
        );
        return $result;
    }
    public function getRoomWithoutUser(PlayRoom $playRoom, User $requiredUser): PlayRoom
    {
        $users = $playRoom->getUsers();
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
            $playRoom->getId(),
            $playRoom->getName(),
            $playRoom->getDescription(),
            $playRoom->$updatedUsers,
            $playRoom->isOpen(),
            $playRoom->isRunning()
        );
        return $result;
    }
}