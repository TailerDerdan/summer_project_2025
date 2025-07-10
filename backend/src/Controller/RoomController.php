<?php

namespace App\Controller;

use App\Services\PlayRoomService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class RoomController extends AbstractController {
    private PlayRoomService $playRoomService;
    public function __construct(PlayRoomService $playRoomService) {
        $this->playRoomService = $playRoomService;
    }

    public function createPlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }

    public function showPlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }

    public function editPlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }

    public function deletePlayRoom(): Response
    {
        return $this->render("asdf.html.twig");
    }
}
