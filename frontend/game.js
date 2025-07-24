import {arrEnemy} from "./player/player.js";

export let gameIsRun = true;
document.addEventListener('DOMContentLoaded', async () => {
    const data = JSON.parse(sessionStorage.getItem('gameSession'))
    console.log("DATA: ", data)
    if (!data) {
        window.location.href = `/main`
        return
    }
    sessionStorage.removeItem('gameSession');
    await connectToWSGame(data)
})

async function connectToWSGame(data) {
    const gameSocket = new WebSocket(`ws://87.228.90.3:8080/ws/game/${data.gameId}`)
    await startTimer()
    gameSocket.onopen = (e) => {
        gameSocket.send(JSON.stringify({
            type: "game_auth",
            data: {
                userId: (data.userId).toString(),
                nickname: data.nickname,
            }
        }))
    }
    gameSocket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log("msg: ", msg)
        switch (msg.type) {
            case "init_players":
                Object.values(msg.data.players).forEach(playerData => {
                    console.log("playerData: ", playerData)
                    arrEnemy.push(playerData)
                })
                break;
            case "join_player":
                console.log("playerData: ", msg.data)
                arrEnemy.push({
                    playerId: msg.data.userId,
                    nickname: msg.data.nickname,
                })
            //
            // case "player_position":
            //     console.log("player_position")
            //     player.updatePlayerPosition(msg.data.id, msg.data.x, msg.data.y);
            //     break;
            //
            // case "player_left":
            //     console.log("player_left")
            //     player.removePlayer(msg.data.id);
            //     break;
        }
    };
    console.log("XXXXXX")
}


async function startTimer() {
    let countStart = 10
    const countStartElt = document.createElement("div")
    countStartElt.setAttribute("style", "position: fixed; padding: 20px; font-size: 20px;")
    document.body.prepend(countStartElt)
    const timer = setInterval(() => {
        countStartElt.textContent = `Игра завершится через: ${countStart}`
        countStart--
        if (countStart < 0) {
            clearInterval(timer)
            console.log("111")
            showResultsAfterBattle()
            console.log("222")
        }
    }, 1000)
}

function showResultsAfterBattle() {
    console.log("show results")
    const resultsBlock = document.createElement("div")
    resultsBlock.className = "resultsBlock"
    resultsBlock.setAttribute("style", "position: absolute; padding: 100px; background-color: red;")
    resultsBlock.innerHTML = `
        <span>КОНЕЦ БОЯ</span>
        <p>Результаты:</p>
        <div>
            <p>1. ....</p>
            <p>2. ....</p>
            <p>3. ....</p>
        </div>
        <button class="endBtn" type="button">Выйти</button>
    `
    document.body.prepend(resultsBlock)
    const endBtn = document.querySelector(".endBtn")
    gameIsRun = false;
    endBtn.addEventListener('click', () => {
        window.location.href = "/main"
    })
}