import { Container } from "../collisions/collisions.js";
import { Sprite } from "../spriteScript/spriteScript.js";
import { randomPosition } from "../random.js";
import {Sound} from "../soundsScript/sound.js";


const WIDTH_FRAME_BLOOD = 23;
const HEIGHT_FRAME_BLOOD = 34;
const WIDTH_FRAME = 25;
const HEIGHT_FRAME = 34;
const START_X = 0;
const COUNT_SPRITE = 8;
const COUNT_FRAMES = 8;

export class Character
{
    constructor(x, y, width, height, dir)
    {
        console.log('Bot created with:', {x, y, width, height, dir});

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dir = dir;
        this.container = new Container(width, height, x, y, dir);

        this.speed = 0;

        this.isCharacterLive = true;
        this.wasCharacterWounded = false;

        this.sprite = new Sprite(COUNT_FRAMES, './sprites/enemySprite.png', 0.1, true);
        this.sprite.makeFrames(WIDTH_FRAME, HEIGHT_FRAME, START_X);

        this.spriteBlood = new Sprite(COUNT_SPRITE, 'sprites/Gore/sprBloodSplat_strip8.png', 0.1, false);
        this.spriteBlood.makeFrames(WIDTH_FRAME_BLOOD, HEIGHT_FRAME_BLOOD, START_X);

        this.revivalSound = new Sound('sounds/Hotline_Miami_2_Wrong_Number/revival.wav');
    }

    setDir(dir) { this.dir = dir; }

    turnAround(vect)
    {
        let dir = Math.atan2(vect.dy, vect.dx);
        dir = dir * 180 / Math.PI;
        dir += 90;
        if (dir < 0)
        {
            dir += 360;
        }
        this.setDir(dir);
    }

    getNormalVect(vect, length) {
        return {dx: vect.dx/length, dy: vect.dy/length};
    }

    changeDistXYByPhysic(vect)
    {
        return {dx: vect.dx * this.speed, dy: vect.dy * this.speed};

        // dist.distX /= this.weapon.weight * 2;
        // dist.distY /= this.weapon.weight * 2;
    }

    drawCharacter(ctx, xView, yView)
    {
        this.container.deleteVertices();
        this.container.fillVertices();

        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.dir * Math.PI / 180);

        if (!this.isCharacterLive)
        {
            ctx.globalAlpha = 0.3;
        }

        ctx.globalAlpha = 1;

        this.container.updateDir(this.dir);
        this.container.updateX(this.x);
        this.container.updateY(this.y);

        this.container.drawContainer(ctx);

        this.sprite.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }

    drawBlood(ctx, xView, yView)
    {
        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.dir * Math.PI / 180);

        this.sprite.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, this.width, this.height);

        if (this.wasCharacterWounded)
        {
            this.spriteBlood.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, this.width * 2, this.height * 2);
        }

        ctx.restore();
    }

    appearanceAfterDeath()
    {
        if (this.isCharacterLive) return;
        const pos = randomPosition();
        this.x = pos.x;
        this.y = pos.y;
        this.isCharacterLive = true;
        this.wasCharacterWounded = false;
        this.spriteBlood.timeForMovement = 0;
        this.spriteBlood.currentFrame = 0;
        this.spriteBlood.isAnimationPlayed = false;
    }

    appearanceAfterDeathWidthDelay() {
        setTimeout(() => this.appearanceAfterDeath(), 3000);
    }

    updateCharacter()
    {
        if (this.wasCharacterWounded)
        {
            this.spriteBlood.playAnimation()
            if (this.spriteBlood.isAnimationPlayed)
            {
                this.isCharacterLive = false;
                this.appearanceAfterDeathWidthDelay();
                this.revivalSound.play();
            }
        }
    }
}
