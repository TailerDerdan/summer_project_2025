import { map } from '../map/map.js';
import { player } from '../player/player.js';
import { Sound } from "../soundsScript/sound.js";
import { Character } from "../Infrastructure/Character.js";
import { InitAssaultRifle, InitShotgun, TYPE_WEAPON, Weapon } from '../weapon/typeWeapons.js';
import { Container } from '../collisions/collisions.js';

const HEALTH_BOT = 100;
const BOT_SPEED = 3;
const OBSTACLE_AVOID_DISTANCE = 100;
const SIDE_STEP_DISTANCE = 50;
const PATH_CHECK_DISTANCE = 200;


class Bot extends Character
{
    constructor(id, x, y, width, height, dir, speed, weapon)
    {
        super(id, x, y, width, height, dir);

        this.speed = speed;
        this.weapon = weapon;

        this.canStrike = false;

        this.soundShoot = new Sound('sounds/Hotline_Miami_2_Wrong_Number/M16.wav');
    }

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }

    setX(x) { this.x = x; }
    setY(y) { this.y = y; }

    getVectorToPlayer(player)
    {
        return {dx: player.x - this.x, dy: player.y - this.y};
    }

    chooseTarget(players)
    {
        let result = {
            id: 0,
            vect: this.getVectorToPlayer(players[0]),
        };
        result.dist = Math.hypot(result.vect.dx, result.vect.dy)

        for (let i=1; i<players.length; i++)
        {
            const vect = this.getVectorToPlayer(players[i]);
            const dist = Math.hypot(vect.dx, vect.dy);

            if (dist < result.dist) {
                result = {id: i, vect: vect, dist: dist};
            }
        }

        return result;
    }

    lineLineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (den === 0) return false;

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;

        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    lineRectIntersect(x1, y1, x2, y2, rx, ry, rw, rh) {
        return this.lineLineIntersect(x1, y1, x2, y2, rx, ry, rx + rw, ry) || // верх
            this.lineLineIntersect(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) || // право
            this.lineLineIntersect(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh) || // низ
            this.lineLineIntersect(x1, y1, x2, y2, rx, ry, rx, ry + rh); // лево
    }

    checkObstacleInPath(startX, startY, endX, endY) {
        for (const obstacle of map.walls) {
            if (this.lineRectIntersect(
                startX, startY, endX, endY,
                obstacle.x, obstacle.y, obstacle.width, obstacle.height
            ))
            {
                return obstacle;
            }
        }
        return null;
    }

    vectorsAngle(v1, v2) {
        const dot = v1.dx*v2.dx + v1.dy*v2.dy;
        const mag1 = Math.hypot(v1.dx, v1.dy);
        const mag2 = Math.hypot(v2.dx, v2.dy);
        return Math.acos(dot / (mag1 * mag2));
    }

    getMoreDirectVector(vect1, vect2, originalVect) {
        const angle1 = this.vectorsAngle(originalVect, vect1);
        const angle2 = this.vectorsAngle(originalVect, vect2);
        return angle1 < angle2 ? vect1 : vect2;
    }

    checkPathForObstacles(vect) {
        const endX = this.x + vect.dx * PATH_CHECK_DISTANCE;
        const endY = this.y + vect.dy * PATH_CHECK_DISTANCE;
        return this.checkObstacleInPath(this.x, this.y, endX, endY);
    }

    calculateAvoidanceVector(targetVect, sideStep) {
        return {
            dx: targetVect.dx - targetVect.dy * sideStep,
            dy: targetVect.dy + targetVect.dx * sideStep
        };
    }

    findBestAvoidancePath(targetVect, obstacle) {
        const leftVect = this.calculateAvoidanceVector(targetVect, -SIDE_STEP_DISTANCE);
        const rightVect = this.calculateAvoidanceVector(targetVect, SIDE_STEP_DISTANCE);

        const leftPathClear = !this.checkPathForObstacles(leftVect);
        const rightPathClear = !this.checkPathForObstacles(rightVect);

        if (leftPathClear && rightPathClear) {
            return this.getMoreDirectVector(leftVect, rightVect, targetVect);
        }

        return leftPathClear ? leftVect : rightPathClear ? rightVect : targetVect;
    }

    hasClearPathToPlayer(player) {
        return !this.checkObstacleInPath(
            this.x, this.y,
            player.x, player.y
        );
    }

    updateMovementBot(ctx, xView, yView) {
        const players = [player];
        const target = this.chooseTarget(players);
        let moveVect = this.getNormalVect(target.vect, target.dist);
        if (players[target.id])
        {
            if ((target.dist < 1200) && (target.dist > 100))
            {
                if (this.hasClearPathToPlayer(players[target.id])) {
                    const stepVect = this.changeDistXYByPhysic(moveVect);

                    this.turnAround(moveVect);
                    this.x += stepVect.dx;
                    this.y += stepVect.dy;

                    this.canStrike = true;
                } else {
                    this.canStrike = false;

                    const obstacle = this.checkObstacleInPath(
                        this.x, this.y,
                        this.x + moveVect.dx * OBSTACLE_AVOID_DISTANCE,
                        this.y + moveVect.dy * OBSTACLE_AVOID_DISTANCE
                    );

                    if (obstacle) {
                        moveVect = this.findBestAvoidancePath(moveVect, obstacle);
                    }

                    const stepVect = this.changeDistXYByPhysic(moveVect);

                    this.turnAround(moveVect);
                    this.x += stepVect.dx;
                    this.y += stepVect.dy;
                }
            }
            else
            {
                if (target.dist >= 1200)
                {
                    this.canStrike = false;
                }
            }
        }

        this.drawCharacter(ctx, xView, yView);
    }
}

const weaponBot1 = new Weapon(InitShotgun, TYPE_WEAPON.ASSAULT_RIFLE);
const weaponBot2 = new Weapon(InitShotgun, TYPE_WEAPON.SHOTGUN);
const weaponBot3 = new Weapon(InitShotgun, TYPE_WEAPON.SNIPER_RIFLE);

//for commit
export const bot1 = new Bot(null, 800, 400, 80, 51.2, 0, BOT_SPEED, weaponBot1);
export const bot2 = new Bot(null, 1500, 300, 80, 51.2, 0, BOT_SPEED, weaponBot2);
export const bot3 = new Bot(null, 700, 2000, 80, 51.2, 0, BOT_SPEED, weaponBot3);