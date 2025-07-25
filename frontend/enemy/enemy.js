import { Sound } from "../soundsScript/sound.js";
import { Character } from "../Infrastructure/Character.js";

const WIDTH_FRAME = 23;
const HEIGHT_FRAME = 34;
const START_X = 0;
const COUNT_SPRITE = 8;

export const WIDTH_ENEMY = 40;
export const HEIGHT_ENEMY = 80;

export class Enemy extends Character
{
    constructor(id, x, y, width, height, dir)
    {
        super(id, x, y, width, height, dir);

        this.soundShoot = new Sound('sounds/Hotline_Miami_2_Wrong_Number/M16.wav');
    }
}

// export const enemy1 = new Enemy(600, 600, 80, 51.2, 0);