import { Container } from '../collisions/collisions.js';
import { Sprite } from '../spriteScript/spriteScript.js';
import { InitAssaultRifle, InitShotgun, TYPE_WEAPON, Weapon } from '../weapon/typeWeapons.js';
import { Character } from "../Infrastructure/Character.js";
import { bot1, bot2, bot3 } from "../bot/Bot.js";
import {Sound} from "../soundsScript/sound.js";
import { HEIGHT_MAP, WIDTH_MAP } from '../sizes.js';
import { Blood, remainingBlood } from "../blood/blood.js";
import {playerDeath, playerKill} from './KillAndDeath.js';
import { initGameWebsocket, sendWebSocketMessage, setMessageHandler, stateForWS } from "../ws/websocketGame.js";
import {randomPosition} from "../random.js";

const WIDTH_FRAME = 23;
const HEIGHT_FRAME = 34;
const START_X = 0;
const COUNT_FRAMES = 10;

export const arrBot = [bot1];
export const arrEnemy = new Map();

export class Player extends Character
{
    constructor(id, x, y, dir, width, height, speed, weapon)
    {
        super(id, x, y, width, height, dir, weapon);

        this.speed = speed;

        this.sprite = new Sprite(COUNT_FRAMES, './sprites/playerSprite.png', 0.1, true);
        this.sprite.makeFrames(WIDTH_FRAME, HEIGHT_FRAME, START_X);

        this.soundShoot = new Sound('sounds/Hotline_Miami_2_Wrong_Number/M16.wav');

        this.lightPosition = {
            x: this.x,
            y: this.y
        };

        this.throttleUpd = null;
        this.intervalId = 0;
        this.throttleUpdateBullets = null;
        this.regularShootHandler = null;
        this.regularStopHandler = null;
    }

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }

    setDir(dir) { this.dir = dir; }
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }

    lineIntersection(a, b, c, d)
    {
        const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
        const numerator1 = (a.y - c.y) * (d.x - c.x) - (a.x - c.x) * (d.y - c.y);
        const numerator2 = (a.y - c.y) * (b.x - a.x) - (a.x - c.x) * (b.y - a.y);

        if (denominator === 0) return numerator1 === 0 && numerator2 === 0;

        const r = numerator1 / denominator;
        const s = numerator2 / denominator;

        return r >= 0 && r <= 1 && s >= 0 && s <= 1;
    }

    checkWallCollision(wall)
    {
        const playerLeft = this.x;
        const playerRight = this.x + this.width;
        const playerTop = this.y;
        const playerBottom = this.y + this.height;

        const wallLeft = wall.x;
        const wallRight = wall.x + wall.width;
        const wallTop = wall.y;
        const wallBottom = wall.y + wall.height;

        if (playerRight < wallLeft || playerLeft > wallRight || playerBottom < wallTop || playerTop > wallBottom)
        {
            return false;
        }

        const playerSides = [
            { a: { x: playerLeft, y: playerTop }, b: { x: playerRight, y: playerTop } },
            { a: { x: playerRight, y: playerTop }, b: { x: playerRight, y: playerBottom } },
            { a: { x: playerRight, y: playerBottom }, b: { x: playerLeft, y: playerBottom } },
            { a: { x: playerLeft, y: playerBottom }, b: { x: playerLeft, y: playerTop } }
        ];

        const wallSides = [
            { a: { x: wallLeft, y: wallTop }, b: { x: wallRight, y: wallTop } },
            { a: { x: wallRight, y: wallTop }, b: { x: wallRight, y: wallBottom } },
            { a: { x: wallRight, y: wallBottom }, b: { x: wallLeft, y: wallBottom } },
            { a: { x: wallLeft, y: wallBottom }, b: { x: wallLeft, y: wallTop } }
        ];

        for (const playerSide of playerSides)
        {
            for (const wallSide of wallSides)
            {
                if (this.lineIntersection(playerSide.a, playerSide.b, wallSide.a, wallSide.b))
                {
                    return true;
                }
            }
        }

        return false;
    }

    updatePosition(distX, distY, keyDict, walls)
    {
        const originalX = this.x;
        const originalY = this.y;

        const isWasMovement = {
            keyW: false,
            keyD: false,
            keyS: false,
            keyA: false,
        };

        if (keyDict.KeyW)
        {
            this.y -= distY;
            this.x += distX;
            isWasMovement.keyW = true;

        }
        if (keyDict.KeyS)
        {
            this.y += distY;
            this.x -= distX;
            isWasMovement.keyS = true;
        }

        if (keyDict.KeyD)
        {
            this.y += distX;
            this.x += distY;
            isWasMovement.keyD = true;
        }
        if (keyDict.KeyA)
        {
            this.y -= distX;
            this.x -= distY;
            isWasMovement.keyA = true;
        }

        let collided = false;
        for (const wall of walls)
        {
            if (this.checkWallCollision(wall))
            {
                collided = true;
                break;
            }
        }

        if (collided)
        {
            this.x = originalX;
            this.y = originalY;
        }

        if (this.y < 0) this.y = 0;
        if (this.y > HEIGHT_MAP) this.y = HEIGHT_MAP;

        if (this.x < 0) this.x = 0;
        if (this.x > WIDTH_MAP) this.x = WIDTH_MAP;

        if (this.weapon)
        {
            this.weapon.x = player.x;
            this.weapon.y = player.y;
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

    drawCurrentAmmo()
    {
        let currentAmmo = 0;
        if (this.weapon)
        {
            currentAmmo = this.weapon.currentAmmo;
        }
        const spanCurrentAmmo = document.getElementById("currentAmmoPlayer");
        spanCurrentAmmo.textContent = currentAmmo;
    }

    updatePlayer() {
        if (this.wasCharacterWounded && this.isCharacterLive) {
            console.log('death player');
            this.handleDeath();
        }
        if (!this.isCharacterLive && !this.respawnTimer) {
            this.startRespawnTimer();
        }
    }

    handleDeath() {
        this.isCharacterLive = false;
        const blood = new Blood(this);
        remainingBlood.push(blood);
        blood.playAnimationBlood();

        //playerDeath(this.id);
    }

    startRespawnTimer() {
        this.respawnTimer = setTimeout(() => {
            console.log("try respawn");
            sendWebSocketMessage({
                type: "player_respawn",
                //data: { playerId: this.id.toString() }
                data: {
                    playerId: stateForWS.userId.toString()
                }
            });
            this.respawnTimer = null;
        }, 2500);
    }
}

export const player = new Player(null, 400, 400, 0, 75, 48, 14, null);