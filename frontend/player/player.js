import { Container } from '../collisions/collisions.js';
import { randomPosition } from '../random.js';
import { Sprite } from '../spriteScript/spriteScript.js';
import { InitAssaultRifle, InitShotgun, TYPE_WEAPON, Weapon } from './../weapon/typeWeapons.js';

const WIDTH_FRAME = 23;
const HEIGHT_FRAME = 34;
const START_X = 0;
const COUNT_FRAMES = 10;

// const WIDTH_FRAME = 25;
// const HEIGHT_FRAME = 16;
// const START_X = 0;
// const COUNT_FRAMES = 8;

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

        this.isPlayerLive = true;

        this.sprite = new Sprite(COUNT_FRAMES, './sprites/playerSprite.png', 0.1, true);
        this.sprite.makeFrames(WIDTH_FRAME, HEIGHT_FRAME, START_X);

        this.lightPosition = {x: 0, y: -1};
    }

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }

    setDir(dir) { this.dir = dir; }
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }

    delay(f, ms)
    {
        return function() {
            setTimeout(() => f.apply(this, arguments), ms);
        };
    }

    drawPlayer(ctx, xView, yView) 
    {    
        this.container.deleteVertices();
        this.container.fillVertices();

        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.dir * Math.PI / 180);

        this.container.updateDir(this.dir);
        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);

        if (!this.isPlayerLive)
        {
            ctx.globalAlpha = 0.3;
        }

        this.sprite.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, this.width, this.height)

        ctx.globalAlpha = 1;
        
        ctx.restore();
    }

    updatePostion(distX, distY, keyDict)
    {
        let isWasMovement = false;
        if (keyDict.KeyW) 
        {
            this.y -= distY;
            this.x += distX;
            isWasMovement = true;
        }
        if (keyDict.KeyS)
        {
            this.y += distY;
            this.x -= distX;
            isWasMovement = true;
        }

        if (keyDict.KeyD) 
        {
            this.y += distX;
            this.x += distY;
            isWasMovement = true;
        }
        if (keyDict.KeyA)
        {
            this.y -= distX;
            this.x -= distY;
            isWasMovement = true;
        }
        return isWasMovement;
    }

    changeDistXYByPhysic(dist)
    {
        dist.distX *= this.speed;
        dist.distY *= this.speed;
    
        // dist.distX /= this.weapon.weight * 2;
        // dist.distY /= this.weapon.weight * 2;
    }

    appearanceAfterDeath(player)
    {
        if (player.isPlayerLive) return;
        const pos = randomPosition();
        player.x = pos.x;
        player.y = pos.y;
        player.isPlayerLive = true;
    }

    appearanceAfterDeathWidthDelay()
    {
        let appearance = this.delay(this.appearanceAfterDeath, 3000);
        appearance(this);
    }
}

const weapon1 = new Weapon(InitShotgun, TYPE_WEAPON.SHOTGUN);

export const player = new Player(400, 400, 12, 0, 75, 48, weapon1);