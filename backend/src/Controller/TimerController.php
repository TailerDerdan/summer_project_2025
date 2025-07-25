<?php

declare(strict_types=1);

namespace App\Controller;

use App\Services\TimerService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TimerController extends AbstractController
{
    #[Route('/timer/start', name: 'timer_start')]
    public function start(TimerService $timerService): JsonResponse
    {
        $timerService->start();
        return $this->json(['status' => 'started']);
    }

    #[Route('/timer/stop', name: 'timer_stop')]
    public function stop(TimerService $timerService): JsonResponse
    {
        $timerService->stop();
        return $this->json(['status' => 'stopped']);
    }

    #[Route('/timer/reset', name: 'timer_reset')]
    public function reset(TimerService $timerService): JsonResponse
    {
        $timerService->reset();
        return $this->json(['status' => 'reset']);
    }

    #[Route('/timer', name: 'timer')]
    public function index(): Response
    {
        return $this->render('Timer/TimerMain.html.twig');
    }
}
