// const keyDict = {};
// const updateKeyDict = (event) => {

//     const k = event.code;
//     if (/^Key[WASD]/.test(k)) {
//         event.preventDefault();
//         keyDict[k] = event.type === 'keydown';
//     }
// };

// const SQRT_2 = 0.707;
// const MAX_DIST = 1;

// export const updateMovementEditor = (player, camera) => {
    
//     let dist = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
//             keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? SQRT_2 : MAX_DIST;
    
//     dist *= 4;
    
//     if (keyDict.KeyW) 
//     {
//         player.y -= dist;
//     }
//     if (keyDict.KeyS)
//     {
//         player.y += dist;
//     }
//     if (keyDict.KeyD) 
//     {
//         player.x += dist;
//     }
//     if (keyDict.KeyA)
//     {
//         player.x -= dist;
//     }

//     if (player.x < camera.minDistX)
//     {
//         player.x = camera.minDistX;
//     }
//     if (player.y < camera.minDistY)
//     {
//         player.y = camera.minDistY;
//     }

//     if (player.x > camera.worldWidth - camera.minDistX)
//     {
//         player.x = camera.worldWidth - camera.minDistX;
//     }
//     if (player.y > camera.worldHeight - camera.minDistY)
//     {
//         player.y = camera.worldHeight - camera.minDistY;
//     }
// }

// document.addEventListener('keydown', updateKeyDict);
// document.addEventListener('keyup', updateKeyDict);