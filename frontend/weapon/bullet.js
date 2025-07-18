import { Container } from "../collisions/collisions.js";

export class Bullet
{
    constructor(x, y, speed, dir, distX, distY, fireRange)
    {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.dir = dir;
        this.startX = x;
        this.startY = y;
        this.distX = distX;
        this.distY = distY;
        this.width = 10;
        this.height = 10;
        this.fireRange = fireRange;
        this.container = new Container(this.width, this.height, x - this.width, y - this.height, dir);
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getDir() { return this.dir; }
    getSpeed() { return this.speed; }
    getDistX() { return this.distX; }
    getDistY() { return this.distY; }
    getStartX() { return this.startX; }
    getStartY() { return this.startY; }
    getFireRange() { return this.fireRange; }

    setX(x) { this.x = x; }
    setY(y) { this.y = y; }

    drawBullet(ctx, xView, yView)
    {
        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.dir * Math.PI / 180);

        ctx.fillStyle = 'black';
        ctx.fillRect((-this.width / 2), (-this.height / 2), this.width, this.height);

        this.container.updateDir(this.dir);
        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);
        
        ctx.restore();
    }

    getRemainingDist()
    {
        if (arguments.length == 2)
        {
            return Math.sqrt(((this.x - xObj) * (this.x - xObj)) + 
                             ((this.y - yObj) * (this.y - yObj)));
        }
        if (arguments.length == 1)
        {
            let traveledDist = Math.sqrt(((this.x - this.startX) * (this.x - this.startX)) + 
                                         ((this.y - this.startY) * (this.y - this.startY)));
            return arguments[0] - traveledDist;
        }
    }
}