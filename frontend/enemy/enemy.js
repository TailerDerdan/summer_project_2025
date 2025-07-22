import { canvasWebgl } from "../canvas.js";
import { Container } from "../collisions/collisions.js";
import { randomPosition } from "../random.js";
import { Sound } from "../soundsScript/sound.js";
import { Sprite } from "../spriteScript/spriteScript.js";

const WIDTH_FRAME = 23;
const HEIGHT_FRAME = 34;
const START_X = 0;
const COUNT_SPRITE = 8;

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

        this.isEnemyLive = true;

        this.wasEnemyWounded = false;

        this.spriteBlood = new Sprite(COUNT_SPRITE, './sprites/Gore/sprBloodSplat_strip8.png', 0.1, false);
        this.spriteBlood.makeFrames(WIDTH_FRAME, HEIGHT_FRAME, START_X);
        this.soundShoot = new Sound('./sounds/Hotline_Miami_2_Wrong_Number/M16.wav');
    }

    delay(f, ms)
    {
        return function() {
            setTimeout(() => f.apply(this, arguments), ms);
        };
    }

    drawEnemy(ctx, xView, yView)
    {
        this.container.deleteVertices();
        this.container.fillVertices();

        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.dir * Math.PI / 180);
        
        if (!this.isEnemyLive)
        {
            ctx.globalAlpha = 0.3;
        }

        ctx.fillStyle = 'blue';
        ctx.fillRect((-this.width / 2), (-this.height / 2), this.width, this.height);

        ctx.globalAlpha = 1;

        this.container.updateDir(this.dir);
        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);

        ctx.restore();
    }

    drawBlood(ctx, xView, yView)
    {
        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.dir * Math.PI / 180);

        if (this.wasEnemyWounded)
        {
            this.spriteBlood.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, this.width * 2, this.height * 2);
        }

        ctx.restore();
    }

    appearanceAfterDeath(enemy)
    {
        if (enemy.isEnemyLive) return;
        const pos = randomPosition();
        enemy.x = 3600;
        enemy.y = 600;
        enemy.isEnemyLive = true;
        enemy.wasEnemyWounded = false;
        enemy.spriteBlood.timeForMovement = 0;
        enemy.spriteBlood.currentFrame = 0;
        enemy.spriteBlood.isAnimationPlayed = false;
    }

    appearanceAfterDeathWidthDelay()
    {
        let appearance = this.delay(this.appearanceAfterDeath, 3000);
        appearance(this);
    }

    updateEnemy()
    {
        if (this.wasEnemyWounded)
        {
            this.spriteBlood.playAnimation()
            if (this.spriteBlood.isAnimationPlayed)
            {
                this.isEnemyLive = false;
            }
        }
        if (!this.isEnemyLive)
        {
            this.appearanceAfterDeathWidthDelay();
        }
    }
}

export const enemy1 = new Enemy(600, 600, 40, 80, 1);