import { Container } from "../collisions/collisions.js";

class Enemy
{
    constructor(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.container = new Container(width, height, x, y, 0);
    }

    drawEnemy(ctx)
    {
        this.container.updateDir(this.dir);
        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);
    }
}

export const enemy1 = new Enemy(600, 600, 40, 40);