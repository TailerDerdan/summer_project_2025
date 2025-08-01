export const stateForWS = {
    gameIsRun: true,
    gameSocket: null,
    userId: -1,
    hostId: -1,
    gameId: null,
    nickname: null,
    mapName: null,
}

export async function initGameWebsocket(data) {
    console.log("5555555")
    if (stateForWS.gameSocket)
    {
        console.log("hkgjhgkhjgk")
        stateForWS.gameSocket.close();
    }

    stateForWS.mapName = data.mapName;
    stateForWS.userId = data.userId;
    stateForWS.hostId = data.hostId;
    stateForWS.gameId = data.gameId;
    stateForWS.nickname = data.nickname;
    
    // stateForWS.gameSocket = new WebSocket(`ws://mochilovo-avi.ru:8080/ws/game/${data.gameId}`)
    return new Promise((resolve, reject) => {
        const wsUrl = `ws://mochilovo-avi.ru:8080/ws/game/${data.gameId}`;
        console.log(`Connecting to ${wsUrl}...`);

        stateForWS.gameSocket = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
            reject(new Error("WebSocket connection timeout"));
            stateForWS.gameSocket?.close();
        }, 5000);

        stateForWS.gameSocket.onopen = (e) => {
            console.log("WebSocket connected, sending auth...");
            clearTimeout(connectionTimeout);

            const authMessage = {
                type: "game_auth",
                data: {
                    userId: data.userId.toString(),
                    nickname: data.nickname,
                }
            };

            stateForWS.gameSocket.send(JSON.stringify(authMessage));
            resolve();
        };

        stateForWS.gameSocket.onclose = (event) => {
            clearTimeout(connectionTimeout);
            console.log('WebSocket closed:', event.code, event.reason);
            if (event.code !== 1000) {
                reject(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
            }
        };

        stateForWS.gameSocket.onerror = (error) => {
            clearTimeout(connectionTimeout);
            console.error('WebSocket error:', error);
            reject(error);
        };

        // Устанавливаем стандартный обработчик сообщений
        stateForWS.gameSocket.onmessage = (event) => {
            console.log("Default message handler:", event.data);
        };
    });
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
    if (stateForWS.gameSocket && stateForWS.gameSocket.readyState === WebSocket.OPEN) 
    {
        stateForWS.gameSocket.send(JSON.stringify(message));
    }
}

// 172.18.0.3