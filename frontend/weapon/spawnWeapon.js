import { getInitValues, Weapon } from "./typeWeapons.js";

export let allWeapon = new Map();

export function spawnWeapon(weaponsServer)
{
    for (const weaponServer of weaponsServer)
    {
        console.log("loop", weaponServer);
        const initValue = getInitValues(weaponServer.type);
        console.log(initValue)
        if (initValue)
        {
            const weapon = new Weapon(initValue, weaponServer.type, weaponServer.x, weaponServer.y);
            allWeapon.set(weaponServer.id.toString(), weapon);
        }
    }
    console.log(allWeapon);
}

export function drawAllWeaponOnMap(ctx, xView, yView)
{
    ctx.save();

    for (const [id, weapon] of allWeapon)
    {
        console.log(id, weapon)
        if (weapon.owner) continue;

        let screenX = weapon.x - xView;
        let screenY = weapon.y - yView;

        console.log(screenY, screenX)

        weapon.container.updateX(weapon.x);
        weapon.container.updateY(weapon.y);

        ctx.drawImage(weapon.sprite, screenX, screenY, weapon.widthSprite, weapon.heightSprite);
        weapon.container.drawContainer(ctx, screenX, screenY);
    };
    
    ctx.restore();
}

export function updateAllWeaponOnMap()
{
    for (const [id, weapon] of allWeapon)
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
    for (const [id, weapon] of allWeapon)
    {
        if (weapon.isExpired)
        {
            allWeapon.delete(id);
        }
    }
}