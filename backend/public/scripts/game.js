document.addEventListener('DOMContentLoaded', () => {
    const data = JSON.parse(sessionStorage.getItem('gameSession'))
    if (!data) {
        console.log('Did not get session game data')
        window.location.href = `/main`
        return
    }
    sessionStorage.removeItem('gameSession');
    connectToWSGame(data)
})

function connectToWSGame(data) {
    const gameSocket = new WebSocket(`ws://localhost:8080/ws/game/${data.gameId}`)
    gameSocket.onopen = (e) => {
        console.log(`ID: ${data.userId} success connect to game map`)
    }
    gameSocket.onmessage = (e) => {
        const dataJson = JSON.parse(e.data)
        console.log("data: ", dataJson)
    }
}
