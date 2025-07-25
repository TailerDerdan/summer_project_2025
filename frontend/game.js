import { Enemy, HEIGHT_ENEMY, WIDTH_ENEMY } from "./enemy/enemy.js";
import { arrEnemy, arrEnemyForWS, player } from "./player/player.js";
import { initGameWebsocket, sendWebSocketMessage, setMessageHandler, stateForWS } from "./websocketGame.js";

let gameTimer;
let remainingTime = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const data = JSON.parse(sessionStorage.getItem('gameSession'))
    console.log("DATA: ", data)

    if (!data) {
        window.location.href = `/main`
        return
    }
    sessionStorage.removeItem('gameSession');

    try 
    {
        await initGameWebsocket(data);
        await startTimer();

        setMessageHandler((event) => {
            const msg = JSON.parse(event.data);
            console.log("msg: ", msg);
            
            switch (msg.type) {
                case "init_players":
                    console.log(msg);
                    handleInitPlayers(msg);
                    break;
                case "join_player":
                    handleJoinPlayer(msg.data);
                    break;
                case "player_move":
                    handlePlayerMove(msg.data);
                    break;
                case "time_update":
                    updateTimer(msg.data.remaining);
                    break;
                case "game_end":
                    endGame();
                    gameSocket.send(JSON.stringify({
                        type: "game_ended",
                        data: { gameId: msg.data.gameId }
                    }));
                    gameSocket.close();
                    break;
            }
        });

        checkAndSendPosition();
    }
    catch (error) {
        console.error("WebSocket error:", error);
        window.location.href = '/main';
    }
});

function handleInitPlayers(players)
{
    Object.values(players).forEach(playerData => {

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
}

function handleJoinPlayer(data)
{
    console.log("playerData(join room): ", data)

    const enemy = arrEnemyForWS.find((elem) => {
        if (elem.userId == data.userId) return true;
    });

    if (!enemy)
    {
        arrEnemyForWS.push({
            x: data.x,
            y: data.y,
            userId: data.userId,
        })
        const newEnemy = new Enemy(data.userId, data.x, data.y, WIDTH_ENEMY, HEIGHT_ENEMY);
        arrEnemy.push(newEnemy);
        console.log(arrEnemy);
    }
}

function handlePlayerMove(data)
{
    console.log("playerMove: ", data);
    updateEnemyPosition(data.userId, data.x, data.y);
}

function endGame() {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    gameIsRun = false;
    showResultsAfterBattle();
}

function updateTimer(seconds) {
    remainingTime = seconds;

    if (!gameTimer) {
        const timerElement = document.createElement("div");
        timerElement.setAttribute("style", "position: fixed; top: 10px; right: 10px; font-size: 24px; color: white;");
        document.body.prepend(timerElement);

        gameTimer = setInterval(() => {
            remainingTime--;

            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;

            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (remainingTime <= 0) {
                clearInterval(gameTimer);
                showResultsAfterBattle();
            }
        }, 1000);
    }
}

// async function startTimer() {
//     let countStart = 10
//     const countStartElt = document.createElement("div")
//     countStartElt.setAttribute("style", "position: fixed; padding: 20px; font-size: 20px;")
//     document.body.prepend(countStartElt)
//     const timer = setInterval(() => {
//         countStartElt.textContent = `Игра завершится через: ${countStart}`
//         countStart--
//         if (countStart < 0) {
//             clearInterval(timer)
//             console.log("111")
//             showResultsAfterBattle()
//             console.log("222")
//         }
//     }, 1000)
// }

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
    stateForWS.gameIsRun = false;
    endBtn.addEventListener('click', () => {
        window.location.href = "/main"
    })
}

let lastSentPosition = {
    x: 0,
    y: 0,
}

let lastSentTime = 0;

export function checkAndSendPosition()
{
    const now = Date.now();
    const currentPos = getCurrentPosition();

    console.log(now - lastSentTime);

    if (now - lastSentTime > 100 && 
        (Math.abs(currentPos.x - lastSentPosition.x) > 5 ||
        Math.abs(currentPos.y - lastSentPosition.y) > 5)
    )
    {
        sendWebSocketMessage(JSON.stringify({
            type: "player_move",
            data: {
                userId: stateForWS.userId.toString(),
                x: currentPos.x,
                y: currentPos.y,
            }
        }));

        lastSentPosition = {...currentPos};
        lastSentTime = now;
    }
}

function getCurrentPosition()
{
    return {x: player.x, y: player.y};
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