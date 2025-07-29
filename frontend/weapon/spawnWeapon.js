import { randomMinMax, randomPosition } from "../random.js";
import { InitAssaultRifle, TYPE_WEAPON, Weapon } from "./typeWeapons.js";

const MIN_COUNT = 1;
const MAX_COUNT = 6;

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

export const allWeapon = [];

export function spawnWeapon()
{
    setInterval(() => {
        
        let random = randomMinMax(0, sumOfAllWeight);
        let currentWeight = 0;

        for (const [typeWeapon, weight] of tableOfWeightOfWeapon)
        {
            currentWeight += weight;
            if (currentWeight > random)
            {
                if (typeWeapon == TYPE_WEAPON.NONE) break;
                let initValues;
                switch (typeWeapon) {
                    case TYPE_WEAPON.ASSAULT_RIFLE:
                        initValues = InitAssaultRifle;
                        break;
                    case TYPE_WEAPON.SHOTGUN:
                        initValues = InitAssaultRifle;
                        break;
                    case TYPE_WEAPON.SNIPER_RIFLE:
                        initValues = InitAssaultRifle;
                        break;
                    default:
                        break;
                }
                const randPos = randomPosition();
                const weapon = new Weapon(initValues, typeWeapon, randPos.x, randPos.y);
            }
        }
    }, 3000)
}