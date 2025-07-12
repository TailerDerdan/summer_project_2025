import { Container } from "../collisions/collisions.js";

class Enemy
{
    constructor(x, y, width, height, dir)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dir = dir;
        this.container = new Container(width, height, x, y, dir);
    }

    drawEnemy(ctx, xView, yView)
    {
        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.dir * Math.PI / 180);

        ctx.fillStyle = 'red';
        ctx.fillRect((-this.width / 2), (-this.height / 2), this.width, this.height);

        this.container.updateDir(this.dir);
        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);
        
        ctx.restore();
    }
}

export const enemy1 = new Enemy(600, 600, 40, 80, 1);