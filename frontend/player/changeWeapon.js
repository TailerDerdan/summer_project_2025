import { allWeapon } from "../weapon/spawnWeapon.js";
import { TYPE_WEAPON } from "../weapon/typeWeapons.js";
import { player } from "./player.js"

document.addEventListener("mousedown", (event) => {
    if (event.button == 2)
    {
        event.preventDefault();

        if (player.weapon)
        {
            const weaponPlayer = player.weapon;
            player.weapon = null;
            weaponPlayer.owner = null;
            weaponPlayer.container.fillVertices();
            allWeapon.push(weaponPlayer);
        }

        for (const weapon of allWeapon)
        {
            console.log(weapon);
            if (weapon.currentAmmo == 0) continue;
            if (player.container.isTwoContainerConcerns(weapon.container))
            {
                player.weapon = weapon;
                weapon.owner = player;
                break;
            }
        }
    }
});

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});