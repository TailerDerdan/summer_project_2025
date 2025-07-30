import { randomMinMax, randomPosition } from "../random.js";
import { InitAssaultRifle, InitShotgun, InitSniperRifle, TYPE_WEAPON, Weapon } from "./typeWeapons.js";

const MAX_COUNT_WEAPON_ON_MAP = 10;

const tableOfWeightOfWeapon = new Map();
let sumOfAllWeight = 0;

function MakeTableOfWeight()
{
    tableOfWeightOfWeapon.set(TYPE_WEAPON.NONE, 1000);
    sumOfAllWeight += tableOfWeightOfWeapon.get(TYPE_WEAPON.NONE);
    tableOfWeightOfWeapon.set(TYPE_WEAPON.ASSAULT_RIFLE, 3);
    sumOfAllWeight += tableOfWeightOfWeapon.get(TYPE_WEAPON.ASSAULT_RIFLE);
    tableOfWeightOfWeapon.set(TYPE_WEAPON.SHOTGUN, 5);
    sumOfAllWeight += tableOfWeightOfWeapon.get(TYPE_WEAPON.SHOTGUN);
    tableOfWeightOfWeapon.set(TYPE_WEAPON.SNIPER_RIFLE, 4);
    sumOfAllWeight += tableOfWeightOfWeapon.get(TYPE_WEAPON.SNIPER_RIFLE);
}

MakeTableOfWeight();

export let allWeapon = [];

function spawnWeapon()
{
    for (let iter = 0; iter < MAX_COUNT_WEAPON_ON_MAP; iter++)
    {
        const weapon = new Weapon(InitShotgun, TYPE_WEAPON.SHOTGUN, iter * 100, 500);
        allWeapon.push(weapon);
    }
}

spawnWeapon();

export function drawAllWeaponOnMap(ctx, xView, yView)
{
    ctx.save();

    for (const weapon of allWeapon)
    {
        if (weapon.owner) continue;

        let screenX = weapon.x - xView;
        let screenY = weapon.y - yView;

        weapon.container.updateX(weapon.x);
        weapon.container.updateY(weapon.y);

        ctx.drawImage(weapon.sprite, screenX, screenY, weapon.widthSprite, weapon.heightSprite);
        weapon.container.drawContainer(ctx, screenX, screenY);
    };
    
    ctx.restore();
}

export function updateAllWeaponOnMap()
{
    for (const weapon of allWeapon)
    {
        if (weapon.currentAmmo <= 0 && !weapon.owner)
        {
            if (!weapon.expireTime)
            {
                weapon.expireTime = Date.now() + 2000;
            }
            else if (Date.now() >= weapon.expireTime)
            {
                weapon.isExpired = true;
            }
        }
    }
    allWeapon = allWeapon.filter(weapon => !weapon.isExpired);
}