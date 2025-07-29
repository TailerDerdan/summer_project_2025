import {sendWebSocketMessage} from "../websocketGame";

export function playerKill(playerId) {
    const msg = {
        type: "player_kill",
        data: {
            playerId: playerId,
        }
    }
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