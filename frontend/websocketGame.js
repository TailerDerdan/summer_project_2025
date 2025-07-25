export const stateForWS = {
    gameIsRun: true,
    gameSocket: null,
    userId: -1,
    gameId: null,
    nickname: null,
}

export async function initGameWebsocket(data) {
    if (stateForWS.gameSocket)
    {
        stateForWS.gameSocket.close();
    }

    stateForWS.userId = data.userId;
    stateForWS.gameId = data.gameId;
    stateForWS.nickname = data.nickname;

    stateForWS.gameSocket = new WebSocket(`ws://mochilovo-avi.ru:8080/ws/game/${data.gameId}`)

    return new Promise((resolve, reject) => {
        stateForWS.gameSocket.onopen = (e) => {
            stateForWS.gameSocket.send(JSON.stringify({
                type: "game_auth",
                data: {
                    userId: data.userId.toString(),
                    nickname: data.nickname,
                }
            }));
            resolve();
        }

        stateForWS.gameSocket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            if (event.code !== 1000) {
                console.error('Connection closed unexpectedly');
            }
        };

        stateForWS.gameSocket.onerror = (error) => {
            reject(error);
        };
    })
}

export function setMessageHandler(handler)
{
    if (stateForWS.gameSocket)
    {
        stateForWS.gameSocket.onmessage = handler;
    }
}

export function sendWebSocketMessage(message) 
{
    console.log(stateForWS.gameSocket.readyState)
    if (stateForWS.gameSocket && stateForWS.gameSocket.readyState === WebSocket.OPEN) 
    {
        stateForWS.gameSocket.send(JSON.stringify(message));
    }
}