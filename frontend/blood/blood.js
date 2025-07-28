import { randomMinMax } from "../random.js";
import { Sprite } from "../spriteScript/spriteScript.js";

const WIDTH_SPRITE_1 = 16;
const HEIGHT_SPRITE_1 = 5;
const COUNT_SPRITE_1 = 6;

const WIDTH_SPRITE_2 = 12;
const HEIGHT_SPRITE_2 = 16;
const COUNT_SPRITE_2 = 9;

const WIDTH_SPRITE_3 = 18;
const HEIGHT_SPRITE_3 = 24;
const COUNT_SPRITE_3 = 8;

export class Blood
{
    constructor(followObject)
    {
        this.sprite1 = new Sprite(COUNT_SPRITE_1, "./sprites/Gore/sprBloodDrop_strip6.png", 0.1, false);
        this.sprite2 = new Sprite(COUNT_SPRITE_2, "./sprites/Gore/sprBloodSmoke_strip9.png", 0.1, false);
        this.sprite3 = new Sprite(COUNT_SPRITE_3, "./sprites/Gore/sprBloodSplat_strip8.png", 0.1, false);

        this.sprite1.makeFrames(WIDTH_SPRITE_1, HEIGHT_SPRITE_1, 0);
        this.sprite2.makeFrames(WIDTH_SPRITE_2, HEIGHT_SPRITE_2, 0);
        this.sprite3.makeFrames(WIDTH_SPRITE_3, HEIGHT_SPRITE_3, 0);

        this.followObject = followObject;

        this.dir1 = randomMinMax(0, 120);
        this.dir2 = randomMinMax(this.dir1, 240);
        this.dir3 = randomMinMax(this.dir2, 359);

        this.isAnimationPlayed = false;

        this.x = followObject.x;
        this.y = followObject.y;
        this.width = followObject.width;
        this.height = followObject.height;
    }

    initSprites()
    {
        this.sprite1.timeForMovement = 0;
        this.sprite1.currentFrame = 0;
        this.sprite1.isAnimationPlayed = false;

        this.sprite2.timeForMovement = 0;
        this.sprite2.currentFrame = 0;
        this.sprite2.isAnimationPlayed = false;

        this.sprite3.timeForMovement = 0;
        this.sprite3.currentFrame = 0;
        this.sprite3.isAnimationPlayed = false;
    }

    drawBlood(ctx, xView, yView)
    {
        ctx.save();

        let screenX = this.x - xView;
        let screenY = this.y - yView;

        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);

        ctx.rotate(this.dir1 * Math.PI / 180);
        this.sprite1.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, WIDTH_SPRITE_1 * 4, HEIGHT_SPRITE_1 * 2);

        ctx.rotate(this.dir2 * Math.PI / 180);
        this.sprite2.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, WIDTH_SPRITE_2 * 4, HEIGHT_SPRITE_2 * 2);

        ctx.rotate(this.dir3 * Math.PI / 180);
        this.sprite3.applyToSpriteMovement(ctx, -this.width / 2, -this.height / 2, WIDTH_SPRITE_3 * 4, HEIGHT_SPRITE_3 * 2);
        
        ctx.restore();
    }

    playAnimationBlood()
    {
        this.sprite1.playAnimation(1/10000);
        this.sprite2.playAnimation(1/10000);
        this.sprite3.playAnimation(1/10000);
        this.isAnimationPlayed = true;
    }
}

export const remainingBlood = [];

export function drawRemainingBlood(ctx, xView, yView)
{
    remainingBlood.forEach((elem) => {
        
        elem.drawBlood(ctx, xView, yView);
    });
}