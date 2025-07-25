import { Enemy, HEIGHT_ENEMY, WIDTH_ENEMY } from "./enemy/enemy.js";
import { arrEnemy, arrEnemyForWS } from "./player/player.js";

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

        checkAndSendPosition(gameSocket, data.userId);
    }
    gameSocket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log("msg: ", msg)
        switch (msg.type) {
            case "init_players":
                Object.values(msg.data.players).forEach(playerData => {

                    console.log("playerData(init_players): ", playerData)

                    const enemy = arrEnemyForWS.find((elem) => {
                        if (elem.playerId == playerData.playerId) return true;
                    });

                    if (!enemy)
                    {
                        arrEnemyForWS.push({
                            x: playerData.x,
                            y: playerData.y,
                            userId: playerData.playerId,
                        })
                        const newEnemy = new Enemy(playerData.playerId, playerData.x, playerData.y, WIDTH_ENEMY, HEIGHT_ENEMY);
                        arrEnemy.push(newEnemy);
                        console.log(arrEnemy);
                    }
                })
                break;
            case "join_player":
                console.log("playerData(join room): ", msg.data)

                const enemy = arrEnemyForWS.find((elem) => {
                    if (elem.userId == msg.data.userId) return true;
                });

                if (!enemy)
                {
                    arrEnemyForWS.push({
                        x: msg.data.x,
                        y: msg.data.y,
                        userId: msg.data.userId,
                    })
                    const newEnemy = new Enemy(msg.data.userId, msg.data.x, msg.data.y, WIDTH_ENEMY, HEIGHT_ENEMY);
                    arrEnemy.push(newEnemy);
                    console.log(arrEnemy);
                }
                break;
            case "player_move":
                console.log("playerMove: ", msg.data);
                updateEnemyPosition(msg.data.userId, msg.data.x, msg.data.y);
                break;
        }
    };
    console.log("XXXXXX")
}


async function startTimer() {
    let countStart = 9999
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

const lastSentPosition = {
    x: 0,
    y: 0,
}

let lastSentTime = 0;

function checkAndSendPosition(socket, userId)
{
    const now = Date.now();
    const currentPos = getCurrentPosition();

    if (now - lastSentTime > 100 && 
        (Math.abs(currentPos.x - lastSentPosition.x) > 5 ||
        Math.abs(currentPos.y - lastSentPosition.y) > 5)
    )
    {
        socket.send(JSON.stringify({
            type: "player_move",
            data: {
                userId: userId,
                x: currentPos.x,
                y: currentPos.y,
            }
        }));

        lastSentPosition = {...currentPos};
        lastSentTime = now;
    }
}

function updateEnemyPosition(userId, x, y)
{
    const enemy = arrEnemyForWS.find(e => e.userId == userId);
    if (enemy) {
        enemy.x = x;
        enemy.y = y;
        
        const gameEnemy = arrEnemy.find(e => e.playerId == userId);
        if (gameEnemy) {
            gameEnemy.x = x;
            gameEnemy.y = y;
        }
    }
}