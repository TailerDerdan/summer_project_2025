<?php

namespace App\Services;

use App\Entity\Room\PlayRoom;
use App\Entity\User\User;
use http\Exception\BadMessageException;
use App\Repository\PlayRoomRepository;
use App\Repository\RoomHandlerRepository;

class PlayRoomService implements PlayRoomServiceInterface
{
    private RoomHandlerRepository $roomHandlerRepository;
    private PlayRoomRepository $playRoomRepository;

    public function __construct(
        RoomHandlerRepository $roomHandlerRepository,
        PlayRoomRepository $playRoomRepository)
    {
        $this->roomHandlerRepository = $roomHandlerRepository;
        $this->playRoomRepository = $playRoomRepository;
    }

    public function createPlayRoom($roomParams): int
    {
        if (!(empty($roomParams))) {
            foreach ($roomParams as $key => $value) {
                if (!(isset($value))) {
                    $roomParams[$key] = '';
                }
            }
            $playRoom = new PlayRoom(
                $roomParams["room_id"],
                $roomParams["room_name"],
                $roomParams["room_gamemode"],
                $roomParams["room_open"],
                $roomParams["room_running"],
                time(),
                $roomParams["room_host_id"],
            );

            try {
                $roomId = $this->playRoomRepository->savePlayRoom($playRoom);
                return $roomId;
            } catch (\Exception $e) {
                throw new BadMessageException($e->getMessage("Невозможно создать комнату"));
            }
        }
        else {
            return throw new \UnexpectedValueException("Невозможно создать комнату: поля не должны быть пустыми");
        }
    }
    public function updatePlayRoom($roomParams, $roomId): int
    {
        if (!(empty($roomParams))) {
            foreach ($roomParams as $key => $value) {
                if (!(isset($value))) {
                    $roomParams[$key] = '';
                }
            }

            try {
                $playRoom = $this->playRoomRepository->getPlayRoomById($roomId);

                $playRoom->setName($roomParams["room_name"]);
                $playRoom->setGamemode($roomParams["room_gamemode"]);
                $playRoom->setOpen($roomParams["room_open"]);
                $playRoom->setRunning($roomParams["room_running"]);
                $playRoom->setHostId($roomParams["room_host_id"]);

                $this->playRoomRepository->editPlayRoom($playRoom, $roomId);

                return $playRoom->getId();
            } catch (\Exception $e) {
                throw new BadMessageException($e->getMessage("Не удалось отредактировать комнату: комната не найдена"));
            }
        }
        else {
            return throw new \UnexpectedValueException("Невозможно создать комнату: поля не должны быть пустыми");
        }
    }
    public function deletePlayRoom($roomId): void
    {
        try {
            $this->playRoomRepository->deletePlayRoom($roomId);
        } catch (\Exception $e) {
            throw new BadMessageException($e->getMessage("Не удалось удалить комнату: комната не найдена"));
        }
    }
    public function getRoomById($roomId): ?PlayRoom
    {
        try {
            $playRoom = $this->playRoomRepository->getPlayRoomById($roomId);
            return $playRoom;
        } catch (\Exception $e) {
            throw new BadMessageException($e->getMessage("Не удалось найти комнату: комната не найдена"));
        }
    }

    /**
     * @return ?PlayRoom[]
     */
    public function getAllRooms(): ?array
    {
        try {
            $playRooms = $this->playRoomRepository->getAllPlayRooms();
            return $playRooms;
        } catch (\Exception $e) {
            throw new BadMessageException($e->getMessage("Не удалось найти комнаты"));
        }
    }
}
