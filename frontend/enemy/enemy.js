import { Sound } from "../soundsScript/sound.js";
import { Character } from "../Infrastructure/Character.js";

class Enemy extends Character
{
    constructor(x, y, width, height, dir)
    {
        super(x, y, width, height, dir);

        this.soundShoot = new Sound('sounds/Hotline_Miami_2_Wrong_Number/M16.wav');
    }
}

// export const enemy1 = new Enemy(600, 600, 80, 51.2, 0);