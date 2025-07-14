<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\Game\GameServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class GameController extends AbstractController {

    public function __construct(
        private GameServiceInterface $gameService
    ) {}
    
    public function index(): Response {
        return $this->render("asdf.html.twig");
    }
}