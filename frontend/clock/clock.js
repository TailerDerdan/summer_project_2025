export class Clock
{
    constructor()
    {
        this.restart();
    }

    restart()
    {
        this.lastTime = performance.now();
    }

    getElapsedTime()
    {
        return (performance.now() - this.lastTime) / 1000;
    }
}