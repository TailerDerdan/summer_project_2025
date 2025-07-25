import {arrEnemy} from "./player/player.js";

export let gameIsRun = true;
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
    if (!data) {
        window.location.href = `/main`
        return
    }
    sessionStorage.removeItem('gameSession');
    await connectToWSGame(data)
})

async function connectToWSGame(data) {
    gameData = data
    gameSocket = new WebSocket(`ws://mochilovo-avi.ru:8080/ws/game/${data.gameId}`)
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
        switch (msg.type) {
            case "init_players":
                Object.values(msg.data.players).forEach(playerData => {
                    arrEnemy.push({
                        x: playerData.x,
                        y: playerData.y,
                        id: playerData.playerId,
                    })
                    playersCache[playerData.playerId] = {
                        nickname: playerData.nickname
                    };
                })
                break;
            case "join_player":
                arrEnemy.push({
                    x: msg.data.x,
                    y: msg.data.y,
                    id: msg.data.userId,
                })
                playersCache[msg.data.userId] = {
                    nickname: msg.data.nickname
                };
                break;
            case "time_update":
                updateTimer(msg.data.remaining);
                break;
            case "game_end":
                showResultsAfterBattle(msg.data);
                gameSocket.send(JSON.stringify({
                    type: "game_ended",
                    data: { gameId: msg.data.gameId }
                }));
                gameSocket.close();
                break;
            case "stats_update":
                Object.keys(msg.data.stats).forEach(playerId => {
                    if (!playersCache[playerId]) {
                        playersCache[playerId] = {
                            nickname: `Player_${playerId.substring(0, 4)}`
                        };
                    }
                });

                gameStats.kills = msg.data.stats[data.userId]?.kills || 0;
                gameStats.deaths = msg.data.stats[data.userId]?.deaths || 0;
                gameStats.score = msg.data.stats[data.userId]?.score || 0;
                gameStats.position = msg.data.stats[data.userId]?.position || 0;

                gameStats.leaderboard = msg.data.leaderboard.map((item, index) => ({
                    id: item.ID,
                    nickname: findPlayerNickname(item.ID),
                    kills: msg.data.stats[item.ID]?.kills || 0,
                    deaths: msg.data.stats[item.ID]?.deaths || 0,
                    score: msg.data.stats[item.ID]?.score || 0,
                    position: index + 1,
                    isCurrent: item.ID === data.userId
                }));

                updateStatsUI();
                break;
        }
    };
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

// function showResultsAfterBattle() {
//     const resultsBlock = document.createElement("div")
//     resultsBlock.className = "resultsBlock"
//     resultsBlock.setAttribute("style", "position: absolute; padding: 100px; background-color: red;")
//     resultsBlock.innerHTML = `
//         <span>КОНЕЦ БОЯ</span>
//         <p>Результаты:</p>
//         <div>
//             <p>1. ....</p>
//             <p>2. ....</p>
//             <p>3. ....</p>
//         </div>
//         <button class="endBtn" type="button">Выйти</button>
//     `
//     document.body.prepend(resultsBlock)
//     const endBtn = document.querySelector(".endBtn")
//     gameIsRun = false;
//     endBtn.addEventListener('click', () => {
//         window.location.href = "/main"
//     })
// }

function showResultsAfterBattle(endData) {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    gameIsRun = false;

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
    endBtn.addEventListener('click', () => {
        window.location.href = "/main"
    })
}

export function recordKill(victimId) {
    if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;

    gameSocket.send(JSON.stringify({
        type: "player_kill",
        data: {
            killerId: gameData.userId,
            victimId: victimId,
            gameId: gameData.gameId
        }
    }))
}

export function recordDeath() {
    if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;

    gameSocket.send(JSON.stringify({
        type: "player_death",
        data: {
            playerId: gameData.userId,
            gameId: gameData.gameId
        }
    }))
}

function findPlayerNickname(playerId) {
    if (playersCache[playerId]) {
        return playersCache[playerId].nickname
    }

    if (gameData && gameData.userId === playerId) {
        return gameData.nickname
    }

    return `Player_${playerId}`
}