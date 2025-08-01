import { Enemy, HEIGHT_ENEMY, WIDTH_ENEMY } from "../enemy/enemy.js";
import { WIDTH_MAP, HEIGHT_MAP } from "../sizes.js";
import { arrEnemy, player } from "../player/player.js";
import { playerBullets } from "../weapon/shooting.js";
import { Bullet } from "../weapon/bullet.js";
import { initGameWebsocket, sendWebSocketMessage, setMessageHandler, stateForWS } from "./websocketGame.js";
import { allWeapon, spawnWeapon } from "../weapon/spawnWeapon.js";
import {initGame} from "../main.js";

export let mapName
export const gameStats = {
    kills: 0,
    deaths: 0,
    score: 0,
    position: 0,
    leaderboard: []
};

export let enemyBullets = [];

const statsPanel = document.getElementById("stats-panel")

document.addEventListener('DOMContentLoaded', async () => {
    const data = JSON.parse(sessionStorage.getItem('gameSession'))
    //console.log("gameSession", data)
    if (!data) {
        window.location.href = `/main`
        return
    }
    mapName = data.mapName
    //console.log("mapName, data.mapName", mapName, data.mapName)
    sessionStorage.removeItem('gameSession');

    try
    {
        const promise = initGameWebsocket(data);

        promise.then(
            async () => {
                setMessageHandler((event) => {
                    const msg = JSON.parse(event.data);
                    console.log("MSGGGGG", msg);
                    switch (msg.type) {
                        case "init_players_server":
                            console.log("init_players_server")
                            handleInitPlayers(msg.data.players);
                            break;
                        case "join_player_server":
                            console.log("join_player_server")
                            handleJoinPlayer(msg.data);
                            break;
                        case "time_update_server":
                            handleUpdateTimer(msg.data.remaining);
                            break;
                        case "game_end_server":
                            console.log("players: ", gameStats.leaderboard);
                            gameStats.leaderboard.map(player => {
                                console.log("player: ", player)
                                console.log("userId:", stateForWS.userId)
                            })
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
                        case "player_death_server":
                            //handlePlayerDeath(msg.data);
                            break;
                        case "player_respawn_server":
                            console.log("server sent response spawn", msg.data);
                            handlePlayerRespawn(msg.data);
                            break;
                        case "save_stats_server":
                            console.log("save stats: ")
                            saveStats(msg.data);
                            break;
                        case "generate_weapons_server":
                            handleGenerateWeapons(msg.data);
                            break;
                        // case 'game_state_server':
                        //     console.log("game_state_server");
                        //     handleGameState(msg.data);
                        //     break;
                        case "change_weapon_server":
                            handleChangeWeapon(msg.data);
                            break;
                        case "drop_weapon_server":
                            handleDropWeapon(msg.data);
                            break;
                        case "game_state_update_server":
                            console.log("BLA BLA BLA")
                            handleGameState(msg.data);
                            break;
                    }
                });

                checkAndSendPosition();

                sendBullets();

                await initGame();
            },
            () => {
                console.log("ВСЕ ПЛОХО");
                // return;
            }
        );
    }
    catch (error) {
        console.error("WebSocket error:", error);
        // window.location.href = '/main';
    }
});

function handleGameState(data) {
    const statusElement = document.querySelector('.game-status');
    stateForWS.stateForPlayer = data.status;
    switch (data.status) {
        case 'waiting':
            statusElement.textContent = 'Ожидание игроков...';
            break;

        case 'countdown':
            statusElement.textContent = `До начала игры: ${data.countdown}`;
            if (data.countdown === 0) {
                statusElement.textContent = ''
            }
            break;

        case 'playing':
            statusElement.textContent = '';
            break;
    }
}

function handleInitPlayers(players)
{
    console.log("enemies", players)
    Object.values(players).forEach(player => {
        if (!arrEnemy.has(player.playerId) && player.playerId != stateForWS.userId)
        {
            const newEnemy = new Enemy(player.playerId, player.x, player.y, HEIGHT_ENEMY, WIDTH_ENEMY, player.dir, player.nickname);
            arrEnemy.set(player.playerId, newEnemy);
        }
    })
}

function handleJoinPlayer(player)
{
    if (!arrEnemy.has(player.userId) && player.playerId != stateForWS.userId)
    {
        const newEnemy = new Enemy(player.userId, player.x, player.y, HEIGHT_ENEMY, WIDTH_ENEMY, player.dir, player.nickname);
        arrEnemy.set(player.userId, newEnemy);
    }
}

function handlePlayerMove(data)
{
    if (arrEnemy.has(data.userId))
    {
        const snapshot = {
            x: data.x,
            y: data.y,
            dir: data.dir,
            timestamp: 0,
        }
        arrEnemy.get(data.userId).snapshotBuffer.addSnapshot(snapshot);
        // arrEnemy.get(data.userId).currentState.x = data.x;
        // arrEnemy.get(data.userId).currentState.y = data.y;
        // arrEnemy.get(data.userId).currentState.dir = data.dir;
    }
}

function handleGameEnd(data)
{
    showResultsAfterBattle(data);
    stateForWS.gameSocket.close(1000, "End game");
}

function updateStats() {
    document.getElementById('kills-count').textContent = gameStats.kills;
    document.getElementById('deaths-count').textContent = gameStats.deaths;
    document.getElementById('score-count').textContent = gameStats.score;
    document.getElementById('position-count').textContent = gameStats.position;

    const leaderboardElement = document.getElementById('leaderboard-body');
    leaderboardElement.setAttribute("style", "font-size: 25px;")
    leaderboardElement.innerHTML = gameStats.leaderboard.map(player => `
        <tr ${player.isCurrent ? 'class="highlight" style="color: red"' : 'style="color: blue"'}>
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
        id: item.id,
        nickname: findPlayerNickname(item.id),
        kills: data.stats[item.id]?.kills || 0,
        deaths: data.stats[item.id]?.deaths || 0,
        score: data.stats[item.id]?.score || 0,
        position: index + 1,
        isCurrent: item.id === data.userId
    }));
    //console.log("update stat: ",data.userId, typeof data.userId)

    updateStats();
}

let gameTimer = null;
let remainingTime = 0;

function handleUpdateTimer(seconds) {
    remainingTime = seconds;

    if (!gameTimer) {
        const timerElement = document.createElement("div");
        timerElement.setAttribute("style", "position: fixed; top: 10px; left: 10px; font-size: 70px; color: black;");
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

function showResultsAfterBattle(endData) {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    stateForWS.gameIsRun = false;
    const modal = document.getElementById('gameStatsModal');
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
        font-size: 70px;
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
    `)

    console.log("endData.winner", endData.winner, typeof endData.winner)
    const userId = stateForWS.userId
    console.log("userId", userId, typeof userId)
    const winnerNickname = findPlayerNickname(endData.winner);
    const isWinner = parseInt(endData.winner) === userId;
    console.log("results")
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
            font-size: 60px;
        ">Выйти</button>
    `

    document.body.prepend(resultsBlock)
    const endBtn = document.querySelector(".endBtn")
    stateForWS.gameIsRun = false;
    endBtn.addEventListener('click', () => {
        window.location.href = "/main"
    })
}

function findPlayerNickname(playerId) 
{
    //console.log("arrEnemy.has(playerId.toString())", arrEnemy.get(playerId))
    if (arrEnemy.has(playerId)) {
        //console.log("--===---", arrEnemy.get(playerId).nickname)
        return arrEnemy.get(playerId).nickname;
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
    }, 25);
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
            //console.log(playerBullets);

            sendWebSocketMessage({
                type: "update_bullets",
                data: {
                    userId: stateForWS.userId.toString(),
                    bullets: playerBullets
                }
            });

            lastSentTimeForBullets = now;

            //playerBullets.length = 0;
        }
    }, 25);
}

function updateEnemyBullets(data) {
    enemyBullets = data.bullets.map(bullet => {
        return new Bullet(
            bullet.x,
            bullet.y,
            bullet.speedBullet,
            bullet.dir,
            bullet.distX,
            bullet.distY,
            bullet.fireRange,
            bullet.ownerId
        );
    });
}

// function handlePlayerDeath(data) {
//     const playerId = data.playerId;
//     if (arrEnemy.has(playerId)) {
//         arrEnemy.get(playerId).isCharacterLive = false;
//         arrEnemy.get(playerId).wasCharacterWounded = true;
//     }
//     if (playerId === stateForWS.userId) {
//         player.isCharacterLive = false;
//         player.wasCharacterWounded = true;
//     }
// }

// function handlePlayerDeath(data) {
//     const playerId = data.playerId;
//     if (arrEnemy.has(playerId)) {
//         arrEnemy.get(playerId).wasCharacterWounded = true;
//     }
// }

function handlePlayerDeath(data) {
    const playerId = data.playerId;
    if (arrEnemy.has(playerId)) {
        arrEnemy.get(playerId).wasCharacterWounded = true;
        arrEnemy.get(playerId).isCharacterLive = false;
    }
    if (playerId === stateForWS.userId) {
        player.wasCharacterWounded = true;
        player.isCharacterLive = false;
    }
}

function handlePlayerRespawn(data) {
    const playerId = data.playerId.toString();
    const x = data.newX / 100 * WIDTH_MAP;
    const y = data.newY / 100 * HEIGHT_MAP;

    console.log(playerId, x, y);

    if (arrEnemy.has(playerId)) {
        const enemy = arrEnemy.get(playerId);
        enemy.x = x;
        enemy.y = y;
        enemy.isCharacterLive = true;
        enemy.wasCharacterWounded = false;
    }
    if (playerId === stateForWS.userId) {
        player.x = x;
        player.y = y;
        player.isCharacterLive = true;
        player.wasCharacterWounded = false;
    }
}

async function saveStats(data) {
    console.log("data RRRRRR: ", data)
    let winnerId
    if (data["winner"] == "user") {
        winnerId = stateForWS.userId
    } else {
        winnerId = parseInt(data["winner"])
    }
    const formData = {
        winner: winnerId,
        stats: data["stats"],
    };
    try
    {
        const response = await fetch("/main/profile/updateStats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if (!response.ok) {
            console.log("@ Ошибка")
        }
    }
    catch (error) {
        console.error('Ошибка:', error);
    }
}

function handleGenerateWeapons(data)
{
    console.log("dbqw7dgvqw7iydgqw7ygdqw7gdqw7ydgqw7ydgqw76ydgqw769dgqw796dgqw769dq79w6dgq97w6gd", data)
    spawnWeapon(data.weapons);
}

export function sendChangeWeapon()
{
    console.log("AAAAA BUULLLLEEETTT", player.weapon)
    sendWebSocketMessage({
        type: "change_weapon",
        data: {
            weaponID: player.weapon.id,
        }
    });
}

function handleChangeWeapon(data)
{
    if (arrEnemy.has(data.playerId))
    {
        console.log("HQGDWUYWQGD", data.playerId)
        if (allWeapon.has(data.weaponId))
        {
            console.log("JESUS JESUS JESUS", data.weaponId)
            arrEnemy.get(data.playerId).weapon = allWeapon.get(data.weaponId);
            allWeapon.get(data.weaponId).owner = arrEnemy.get(data.playerId);
            console.log("ZDAROVO OTECH", allWeapon.get(data.weaponId))
        }
        else
        {
            console.log("Такого оружия нет");
        }
    }
}

export function sendDropWeapon()
{
    if (player.weapon)
    {
        sendWebSocketMessage({
        type: "drop_weapon",
        data: {
            ammo: player.weapon.currentAmmo
        }
    });
    }
}

function handleDropWeapon(data)
{
    if (allWeapon.has(data.weaponId))
    {
        const enemyId = allWeapon.get(data.weaponId).owner.id; 
        allWeapon.get(data.weaponId).owner = null;
        allWeapon.get(data.weaponId).currentAmmo = data.ammo;
        allWeapon.get(data.weaponId).x = data.X;
        allWeapon.get(data.weaponId).y = data.Y;
        arrEnemy.get(enemyId).weapon = null;
        console.log(allWeapon)
    }
    else
    {
        console.log("Такого оружия нет");
    }
}