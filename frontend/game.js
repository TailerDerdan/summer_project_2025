document.addEventListener('DOMContentLoaded', () => {
    const data = JSON.parse(sessionStorage.getItem('gameSession'))
    console.log("DATA: ", data.data)
    if (!data) {
        console.log('Did not get session game data')
        window.location.href = `/main`
        return
    }
    sessionStorage.removeItem('gameSession');
    connectToWSGame(data.data)
})

function connectToWSGame(data) {
    const gameSocket = new WebSocket(`ws://localhost:8080/ws/game/${data.data.gameId}`)
    gameSocket.onopen = (e) => {
        console.log(`Success connect to game map`)
        gameSocket.send(JSON.stringify({
            type: "game_state",
            data: {
                userId: data.data.userId,
                gameId: data.data.gameId,
            }
        }))
    }
    gameSocket.onmessage = (e) => {
        const dataJson = JSON.parse(e.data)
        console.log("data: ", dataJson)
        switch (dataJson.type) {
            case "game_state":
                break
            case "update_position":
                break
            case "update_players":
                break
        }
    }
}
