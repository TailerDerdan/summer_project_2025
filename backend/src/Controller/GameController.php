<?php
declare (strict_types= 1);

namespace App\Controller;

use App\Infrastructure\Game\GameServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class GameController extends AbstractController {

    public function __construct(
        private GameServiceInterface $gameService
    ) {}

    public function index(): Response {
        return $this->render("asdf.html.twig");
    }

    public function getMap(string $mapName): JsonResponse {
        $mapsJson = file_get_contents("./mapEditor/maps/maps.json");
        $maps = json_decode($mapsJson, true)["maps"];
        foreach ($maps as $map) {
            if ($mapName === $maps["name"]) {
                return $this->json(["success"=> true, "map" => $map]);
            }
        }
        return $this->json(["success"=> false, "map" => null]);
    }
}
