import { Container } from '../collisions/collisions.js';
import { InitAssaultRifle, TYPE_WEAPON, Weapon } from './../weapon/typeWeapons.js';

export class Player
{
    constructor(x, y, speed, dir, width, height, weapon)
    {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.dir = dir;
        this.width = width;
        this.height = height;
        this.weapon = weapon;
        this.container = new Container(width, height, x, y, dir);
    }

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }
    getDir() { return this.dir; }
    getWidth() { return this.width; }
    getHeight() { return this.height; }
    getSpeed() { return this.speed; }
    getX() { return this.x; }
    getY() { return this.y; }
    getWeapon() { return this.weapon; }

    setDir(dir) { this.dir = dir; }
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }

    drawPlayer(ctx) {
        
        ctx.save();

        ctx.translate(this.getCenterX(), this.getCenterY());
        ctx.rotate(this.getDir() * Math.PI / 180);

        ctx.fillStyle = 'black';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();

        this.container.updateDir(this.dir);
        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);
    }
}

const weapon1 = new Weapon(InitAssaultRifle, TYPE_WEAPON.ASSAULT_RIFLE);

export const player = new Player(400, 400, 8, 0, 30, 40, weapon1);