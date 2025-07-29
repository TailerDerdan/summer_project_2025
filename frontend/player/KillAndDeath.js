import { sendWebSocketMessage } from "../ws/websocketGame.js";

export function playerKill(playerId) {
    const msg = {
        type: "player_kill",
        data: {
            playerId: playerId,
        }
    }
    console.log(msg, playerId);
    sendWebSocketMessage(msg)
}
export function playerDeath(playerId) {
    const msg = {
        type: "player_death",
        data: {
            playerId: playerId,
        }
    }
    sendWebSocketMessage(msg)
}