<?php

declare(strict_types= 1);

namespace App\Repository;

use App\Entity\PlayRoom;

class PlayRoomTable
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

    public function getLastId(): int
    {
        return intval(($this->getConn())->lastInsertId());
    }

    public function savePlayRoom(PlayRoom $playRoom): int
    {
        $req = "
        INSERT INTO `play_room` (`room_id`, `room_name`, `room_gamemode`, `room_open`, `room_running`, `time_create`, `host_id`)
        VALUES (:room_id, :room_name, :room_gamemode, :room_open, :room_running, :time_create, :host_id)
        ";

        $stmt = ($this->getConn())->prepare($req);

        $stmt->bindParam(':room_id', $playRoom->getId());
        $stmt->bindParam(':room_name', $playRoom->getName());
        $stmt->bindParam(':room_gamemode', $playRoom->getGamemode());
        $stmt->bindParam(':room_open', $playRoom->isOpen());
        $stmt->bindParam(':room_running', $playRoom->isRunning());
        $stmt->bindParam(':time_create', $playRoom->getTimeCreate());
        $stmt->bindParam(':host_id', $playRoom->getHostId());
        $stmt->execute();

        if ($stmt !== false)
        {
            return $this->getLastId();
        }
        else
        {
            return throw new \PDOException("Error saving play room");
        }
    }

    public function getPlayRoomById(int $roomId): PlayRoom
    {
        $req = "
        SELECT *
        FROM `play_room`
        WHERE `room_id` = :room_id;
        ";

        $stmt = ($this->getConn())->prepare($req);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->execute();

        $result = $stmt->fetch(\PDO::FETCH_ASSOC); //array of assoc array
        if ($result !== false)
        {
            $room = new PlayRoom(
                $result['room_id'],
                $result['room_name'],
                $result['room_gamemode'],
                $result['room_open'],
                $result['room_running'],
                $result['time_create'],
                $result['host_id']
            );
            return $room;
        }
        else
        {
            return throw new \PDOException("Error getting play room");
        }
    }

    /**
     * @return array [PlayRoom]
     */
    public function getAllPlayRooms(): array
    {
        $req = "
        SELECT *
        FROM `play_room`;
        ";

        $stmt = ($this->getConn())->prepare($req);
        $stmt->execute();

        $result = $stmt->fetch(\PDO::FETCH_ASSOC); //array of assoc array
        if ($result !== false)
        {
            $rooms = [];
            foreach ($result as $row) {
                $room = new PlayRoom(
                    $row['room_id'],
                    $row['room_name'],
                    $row['room_gamemode'],
                    $row['room_open'],
                    $row['room_running'],
                    $row['time_create'],
                    $row['host_id']
                );
                $rooms[] = $room;
            }
            return $rooms;
        }
        else
        {
            return throw new \PDOException("Error getting play rooms");
        }
    }
}
