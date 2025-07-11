<?php

declare(strict_types= 1);

namespace App\Repository;

use App\Entity\User\User;
use App\Entity\Room\PlayRoom;

class RoomHandlerRepository implements RoomHandlerRepositoryInterface
{
    private \PDO $conn;

    public function __construct(\PDO $conn)
    {
        $this->conn = $conn;
    }

    public function getConn(): \PDO
    {
        return $this->conn;
    }

    /**
     * @param int $playRoomId
     * @return ?User[]
     */
    public function getAllUsersByRoomId(int $playRoomId): ?array
    {
        $req = "
        SELECT *
        FROM `user`
        WHERE `room_id` = :room_id;
        ";

        $stmt = ($this->getConn())->prepare($req);
        $stmt->bindParam(':room_id', $playRoomId);
        $stmt->execute();

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        /**
         * @var User[] $users
         */
        $users = [];
        foreach ($result as $userData)
        {
            $user = new User(
                $userData['user_id'],
                $userData['room_id'],
                $userData['user_name'],
                $userData['user_password'],
                $userData['avatar_path']
            );
            $users[] = $user;
        }
        return $users;
    }

    public function saveUserInRoomById(int $userId, int $playRoomId): void
    {
        $req = "
        UPDATE `user`
        SET `room_id` = :room_id,
        WHERE `user_id` = :user_id;
        ";

        $stmt = ($this->getConn())->prepare($req);

        $stmt->bindParam(':room_id', $playRoomId);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        if ($stmt == false)
        {
            throw new \PDOException("Error saving play room");
        }
    }

    public function getRoomIdByUserId(int $userId): ?int
    {
        $req = "
        SELECT *
        FROM `user`
        WHERE `user_id` = :user_id;
        ";

        $stmt = ($this->getConn())->prepare($req);

        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        if ($stmt !== false)
        {
            if (isset($result[0]["room_id"]))
            {
                return $result[0]["room_id"];
            }
            else
            {
                throw new \PDOException("Error fetching play room");
            }
        }
        else
        {
            throw new \PDOException("Error fetching play room");
        }
    }

    public function deleteUserFromRoom(int $userId): void
    {
        $req = "
        UPDATE `user`
        SET `room_id` = NULL,
        WHERE `user_id` = :user_id;
        ";

        $stmt = ($this->getConn())->prepare($req);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        if ($stmt == false)
        {
            throw new \PDOException("Error saving play room");
        }
    }
}
