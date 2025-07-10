<?php
declare (strict_types= 1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Services\GameService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class GameController extends AbstractController {
    private GameService $gameService;

    public function __construct(GameService $gameService) {
        $this->gameService = $gameService;
    }
    public function index(): Response {
        return $this->render("asdf.html.twig");
    }
}