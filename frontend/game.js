import { Enemy, HEIGHT_ENEMY, WIDTH_ENEMY } from "./enemy/enemy.js";
import { arrEnemy, player } from "./player/player.js";
import { playerBullets, updateMovementBullets } from "./weapon/shooting.js";
import { Bullet } from "./weapon/bullet.js";
import { initGameWebsocket, sendWebSocketMessage, setMessageHandler, stateForWS } from "./websocketGame.js";

export const gameStats = {
    kills: 0,
    deaths: 0,
    score: 0,
    position: 0,
    leaderboard: []
};

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

        setMessageHandler((event) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case "init_players_server":
                    handleInitPlayers(msg.data.players);
                    break;
                case "join_player_server":
                    handleJoinPlayer(msg.data);
                    break;
                case "time_update_server":
                    handleUpdateTimer(msg.data.remaining);
                    break;
                case "game_end_server":
                    handleGameEnd(msg.data);
                    break;
                case "stats_update_server":
                    handleUpdateStats(msg.data);
                    break;
                case "player_move_server":
                    handlePlayerMove(msg.data);
                    break;
                case "update_bullets_server":
                    updateEnemyBullets(msg.data);
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
    console.log(players);
    Object.values(players).forEach(player => {
        if (!arrEnemy.has(player.playerId))
        {
            const newEnemy = new Enemy(player.playerId, player.x, player.y, WIDTH_ENEMY, HEIGHT_ENEMY, player.dir);
            arrEnemy.set(player.playerId, newEnemy);
        }
    })
}

function handleJoinPlayer(player)
{
    if (!arrEnemy.has(player.userId))
    {
        const newEnemy = new Enemy(player.userId, player.x, player.y, WIDTH_ENEMY, HEIGHT_ENEMY, player.dir);
        arrEnemy.set(player.userId, newEnemy);
    }
}

function handlePlayerMove(data)
{
    if (arrEnemy.has(data.palyerId))
    {
        arrEnemy.get(data.palyerId).x = data.x;
        arrEnemy.get(data.palyerId).y = data.y;
        arrEnemy.get(data.palyerId).dir = data.angle;
    }
}

function handleGameEnd(data)
{
    showResultsAfterBattle(data);
    stateForWS.gameSocket.send(JSON.stringify({
        type: "game_end",
        data: { gameId: data.gameId }
    }));
    stateForWS.gameSocket.close();
}

function updateStats() {
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

function handleUpdateStats(data)
{
    gameStats.kills = data.stats[stateForWS.userId]?.kills || 0;
    gameStats.deaths = data.stats[stateForWS.userId]?.deaths || 0;
    gameStats.score = data.stats[stateForWS.userId]?.score || 0;
    gameStats.position = data.stats[stateForWS.userId]?.position || 0;

    gameStats.leaderboard = data.leaderboard.map((item, index) => ({
        id: item.ID,
        nickname: findPlayerNickname(item.ID),
        kills: data.stats[item.ID]?.kills || 0,
        deaths: data.stats[item.ID]?.deaths || 0,
        score: data.stats[item.ID]?.score || 0,
        position: index + 1,
        isCurrent: item.ID === data.userId
    }));

    updateStats();
}

let gameTimer = null;
let remainingTime = 0;

function handleUpdateTimer(seconds) {
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
                console.log("END TIMER")
                clearInterval(gameTimer);
                // showResultsAfterBattle();
            }
        }, 1000);
    }
}

function showResultsAfterBattle(endData, userId) {
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
        font-size: 100px;
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
    `)

    const winnerNickname = findPlayerNickname(endData.winner);
    const isWinner = parseInt(endData.winner) === userId;
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
            font-size: 70px;
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

function findPlayerNickname(playerId) 
{
    if (arrEnemy.has[playerId.toString()]) {
        return arrEnemy.get[playerId.toString()].nickname;
    }
    return stateForWS.nickname;
}

let lastSentPosition = {
    x: 0,
    y: 0,
    dir: 0,
}

let lastSentTime = 0;

export function checkAndSendPosition()
{
    setInterval(() => 
    {
        if (player.isCharacterLive)
        {
            const now = Date.now();
            const currentPos = getCurrentPosition();

            if (now - lastSentTime > 100 &&
                (Math.abs(currentPos.x - lastSentPosition.x) > 5 ||
                Math.abs(currentPos.y - lastSentPosition.y) > 5 || Math.abs(currentPos.dir - lastSentPosition.dir) > 3)
            )
            {
                sendWebSocketMessage({
                    type: "player_move",
                    data: {
                        userId: stateForWS.userId.toString(),
                        x: currentPos.x,
                        y: currentPos.y,
                        dir: currentPos.dir,
                    }
                });

                lastSentPosition = {...currentPos};
                lastSentTime = now;
            }
        }
    }, 50);
}

function getCurrentPosition()
{
    return {x: player.x, y: player.y, dir: player.dir};
}

let lastSentTimeForBullets = 0;

export function sendBullets()
{

    setInterval(() => {

        const now = Date.now();

        if ((now - lastSentTimeForBullets > 100) && (playerBullets.length !== 0))
        {
            sendWebSocketMessage({
                type: "update_bullets",
                data: {
                    userId: stateForWS.userId.toString(),
                    bullets: playerBullets
                }
            });

            lastSentTimeForBullets = now;
        }
    }, 20);
}

let enemyBullets = [];

function updateEnemyBullets(data) {
    enemyBullets = data.bullets.map(bullet => {
        return new Bullet(
            bullet.x,
            bullet.y,
            100,// bullet.speed,
            50,//bullet.dir,
            bullet.distX,
            bullet.distY,
            500,//bullet.fireRange,
            { id: data.userId }
        );
    });
}

export function updateAllBullets(ctx, xView, yView) {
    updateMovementBullets();

    enemyBullets.forEach((bullet, index) => {
        bullet.setX(bullet.getX() + bullet.getDistX());
        bullet.setY(bullet.getY() - bullet.getDistY());

        const remainingDist = bullet.getRemainingDist(bullet.getFireRange());
        if (remainingDist >= -4 && remainingDist <= 4) {
            enemyBullets.splice(index, 1);
        }

        bullet.drawBullet(ctx, xView, yView);
    });
}