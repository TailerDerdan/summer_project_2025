import { Container } from "../collisions/collisions.js";

export const TYPE_WEAPON = {
    ASSAULT_RIFLE: 0,
    SNIPER_RIFLE: 1,
    SHOTGUN: 2,
}

export const InitAssaultRifle = {
    ammoCapacity: 30,
    totalAmmo: Infinity,
    currentAmmo: 30,
    fireRange: 1500,
    timeBetweenBul: 0.5,
    weight: 2,
    timeReload: 4,
    damage: 1,
    speedBullet: 6
}

export const InitSniperRifle = {
    ammoCapacity: 5,
    totalAmmo: Infinity,
    currentAmmo: 5,
    fireRange: 3000,
    timeBetweenBul: 2,
    weight: 3,
    timeReload: 6,
    damage: 2,
    speedBullet: 8
}

export const InitShotgun = {
    ammoCapacity: 4,
    totalAmmo: Infinity,
    currentAmmo: 4,
    fireRange: 1200,
    timeBetweenBul: 1,
    weight: 1.6,
    timeReload: 5,
    damage: 2,
    speedBullet: 3
}

export class Weapon
{
    constructor(InitValues, typeWeapon)
    {
        this.ammoCapacity = InitValues.ammoCapacity;
        this.totalAmmo = InitValues.totalAmmo;
        this.currentAmmo = InitValues.currentAmmo;
        this.fireRange = InitValues.fireRange;
        this.timeBetweenBul = InitValues.timeBetweenBul;
        this.weight = InitValues.weight;
        this.timeReload = InitValues.timeReload;
        this.damage = InitValues.damage;
        this.type = typeWeapon;
        this.speedBullet = InitValues.speedBullet;
    }
}

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
        this.radius = 2;
        this.fireRange = fireRange;
        this.container = new Container(this.radius * 2, this.radius * 2, x - this.radius, y - this.radius, dir);
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

    drawBullet(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = 'black';

        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();

        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);
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