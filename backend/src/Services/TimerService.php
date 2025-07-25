<?php

declare(strict_types=1);

namespace App\Services;

use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

class TimerService
{
    private HubInterface $hub;
    private bool $isRunning = false;
    private int $seconds = 0;

    public function __construct(HubInterface $hub)
    {
        $this->hub = $hub;
    }

    private function publishTime(): void
    {
        $update = new Update(
            'timer',
            json_encode(['time' => $this->seconds])
        );

        $this->hub->publish($update);
    }

    private function runTimer(): void
    {
        while ($this->isRunning) {
            sleep(1);
            $this->seconds++;
            $this->publishTime();
        }
    }

    public function start(): void
    {
        if (!($this->isRunning)) {
            $this->isRunning = true;
            $this->runTimer();
        }
    }

    public function stop(): void
    {
        $this->isRunning = false;
    }

    public function reset(): void
    {
        $this->seconds = 0;
        $this->publishTime();
    }

    public function getTime(): int
    {
        return $this->seconds;
    }
}
