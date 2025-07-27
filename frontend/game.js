import { Enemy, HEIGHT_ENEMY, WIDTH_ENEMY } from "./enemy/enemy.js";
import { arrEnemy, arrEnemyForWS, player } from "./player/player.js";
import { initGameWebsocket, sendWebSocketMessage, setMessageHandler, stateForWS } from "./websocketGame.js";

let gameTimer;
let playersCache = {};
let remainingTime = 0;
let gameSocket;
let gameData;

export let gameStats = {
    kills: 0,
    deaths: 0,
    score: 0,
    position: 0,
    leaderboard: []
};

function updateStatsUI() {
    document.getElementById('kills-count').textContent = gameStats.kills;
    document.getElementById('deaths-count').textContent = gameStats.deaths;
    document.getElementById('score-count').textContent = gameStats.score;
    document.getElementById('position-count').textContent = gameStats.position;

    const leaderboardElement = document.getElementById('leaderboard-body');
    leaderboardElement.innerHTML = gameStats.leaderboard.map(player => `
        <tr ${player.isCurrent ? 'class="highlight"' : ''}>
            <td>${player.position}. ${player.nickname}</td>
            <td>${player.kills}</td>
            <td>${player.deaths}</td>
            <td>${player.score}</td>
        </tr>
    `).join('');
}

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
        //await startTimer();

        setMessageHandler((event) => {
            console.log("event.data: ", event.data);
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
                    // endGame();
                    // stateForWS.gameSocket.send(JSON.stringify({
                    //     type: "game_ended",
                    //     data: { gameId: msg.data.gameId }
                    // }));
                    // stateForWS.gameSocket.close();
                    // break;
                    console.log("end game, show results: ")
                    showResultsAfterBattle(msg.data);
                    // stateForWS.gameSocket.send(JSON.stringify({
                    //     type: "game_end",
                    //     data: { gameId: msg.data.gameId }
                    // }));
                    //stateForWS.gameSocket.close();
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
            if (elem.playerId === playerData.playerId) return true;
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
        if (elem.userId === data.userId) return true;
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
// async function connectToWSGame(data) {
//     gameData = data
//     gameSocket = new WebSocket(`ws://mochilovo-avi.ru:8080/ws/game/${data.gameId}`)
//     gameSocket.onopen = (e) => {
//         gameSocket.send(JSON.stringify({
//             type: "game_auth",
//             data: {
//                 userId: (data.userId).toString(),
//                 nickname: data.nickname,
//             }
//         }))
//     }
//     gameSocket.onmessage = (event) => {
//         const msg = JSON.parse(event.data);
//         switch (msg.type) {
//             case "init_players":
//                 Object.values(msg.data.players).forEach(playerData => {
//                     arrEnemy.push({
//                         x: playerData.x,
//                         y: playerData.y,
//                         id: playerData.playerId,
//                     })
//                     playersCache[playerData.playerId] = {
//                         nickname: playerData.nickname
//                     };
//                 })
//                 break;
//             case "join_player":
//                 arrEnemy.push({
//                     x: msg.data.x,
//                     y: msg.data.y,
//                     id: msg.data.userId,
//                 })
//                 playersCache[msg.data.userId] = {
//                     nickname: msg.data.nickname
//                 };
//                 break;
//             case "time_update":
//                 updateTimer(msg.data.remaining);
//                 break;
//             case "game_end":
//                 showResultsAfterBattle(msg.data);
//                 gameSocket.send(JSON.stringify({
//                     type: "game_ended",
//                     data: { gameId: msg.data.gameId }
//                 }));
//                 gameSocket.close();
//                 break;
//             case "stats_update":
//                 Object.keys(msg.data.stats).forEach(playerId => {
//                     if (!playersCache[playerId]) {
//                         playersCache[playerId] = {
//                             nickname: `Player_${playerId.substring(0, 4)}`
//                         };
//                     }
//                 });
//
//                 gameStats.kills = msg.data.stats[data.userId]?.kills || 0;
//                 gameStats.deaths = msg.data.stats[data.userId]?.deaths || 0;
//                 gameStats.score = msg.data.stats[data.userId]?.score || 0;
//                 gameStats.position = msg.data.stats[data.userId]?.position || 0;
//
//                 gameStats.leaderboard = msg.data.leaderboard.map((item, index) => ({
//                     id: item.ID,
//                     nickname: findPlayerNickname(item.ID),
//                     kills: msg.data.stats[item.ID]?.kills || 0,
//                     deaths: msg.data.stats[item.ID]?.deaths || 0,
//                     score: msg.data.stats[item.ID]?.score || 0,
//                     position: index + 1,
//                     isCurrent: item.ID === data.userId
//                 }));
//
//                 updateStatsUI();
//                 break;
//         }
//     };
// }

function updateTimer(seconds) {
    remainingTime = seconds;

    if (!gameTimer) {
        const timerElement = document.createElement("div");
        timerElement.setAttribute("style", "position: fixed; top: 10px; left: 10px; font-size: 50px; color: white;");
        document.body.prepend(timerElement);

        gameTimer = setInterval(() => {
            remainingTime--;

            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;

            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (remainingTime <= 0) {
                clearInterval(gameTimer);
                //showResultsAfterBattle();
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

function showResultsAfterBattle(endData) {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    stateForWS.gameIsRun = false;

    const resultsBlock = document.createElement("div")
    resultsBlock.className = "resultsBlock"
    resultsBlock.setAttribute("style", `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 30px;
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
    `)

    const winnerNickname = findPlayerNickname(endData.winner);
    const isWinner = endData.winner === data.userId;
    console.log("results tyt")
    resultsBlock.innerHTML = `
        <h2>${isWinner ? 'ПОБЕДА!' : 'КОНЕЦ БОЯ'}</h2>
        <p>Победитель: ${winnerNickname}</p>
        <div style="margin: 20px 0;">
            <h3>Ваша статистика:</h3>
            <p>Убийства: ${gameStats.kills}</p>
            <p>Смерти: ${gameStats.deaths}</p>
            <p>Очки: ${gameStats.score}</p>
            <p>Место: ${gameStats.position}</p>
        </div>
        <button class="endBtn" style="
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Выйти</button>
    `

    document.body.prepend(resultsBlock)
    const endBtn = document.querySelector(".endBtn")
    stateForWS.gameIsRun = false;
    endBtn.addEventListener('click', () => {
        window.location.href = "/main"
    })
}

// export function recordKill(victimId) {
//     if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;
//
//     gameSocket.send(JSON.stringify({
//         type: "player_kill",
//         data: {
//             killerId: gameData.userId,
//             victimId: victimId,
//             gameId: gameData.gameId
//         }
//     }))
// }

// export function recordDeath() {
//     if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;
//
//     gameSocket.send(JSON.stringify({
//         type: "player_death",
//         data: {
//             playerId: gameData.userId,
//             gameId: gameData.gameId
//         }
//     }))
// }

function findPlayerNickname(playerId) {
    if (playersCache[playerId]) {
        return playersCache[playerId].nickname
    }

    if (gameData && gameData.userId === playerId) {
        return gameData.nickname
    }

    return `Player_${playerId}`
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
        // sendWebSocketMessage({
        //     type: "player_move",
        //     data: {
        //         userId: stateForWS.userId.toString(),
        //         x: currentPos.x,
        //         y: currentPos.y,
        //     }
        // });

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
    const enemy = arrEnemyForWS.find(e => e.userId === userId);
    if (enemy) {
        enemy.x = x;
        enemy.y = y;

        const gameEnemy = arrEnemy.find(e => e.playerId === userId);
        if (gameEnemy) {
            gameEnemy.x = x;
            gameEnemy.y = y;
        }
    }
}