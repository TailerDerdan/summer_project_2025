document.addEventListener("DOMContentLoaded", (e) => {
    const dataJson = JSON.parse(sessionStorage.getItem('ws_join_data'));
    sessionStorage.removeItem('ws_join_data');
    console.log("dataJson: ", dataJson)
    const socket = connectToWSRoom(dataJson)
    document.getElementById('room_leave').addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('sending leaving from room')
            socket.send(JSON.stringify({
                type: "leave_room",
                data: {
                    userId: (dataJson.data.userId).toString(),
                    nickname: dataJson.data.nickname,
                },
            }));
        }
    });
    const startBtn = document.getElementById('room_start')
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const gameType = document.getElementById('room-gamemode').textContent
                socket.send(JSON.stringify({
                    type: "start_game",
                    data: {
                        userId: (dataJson.userId).toString(),
                        gameType: gameType,
                    }
                }));
            }

        });
    }
})
function connectToWSRoom(dataUser)   {
    console.log(typeof dataUser.roomId)
    const socket = new WebSocket(`ws://mochilovo-avi.ru:8080/ws/room/${dataUser.roomId}`);
    socket.onopen = () => {
        console.log('dataUser: ', dataUser)
        socket.send(JSON.stringify({
            type: "auth",
            data: {
                userId: (dataUser.data.userId).toString(),
                nickname: dataUser.data.nickname,
            }
        }));
        console.log('====>: ', JSON.stringify({
            type: "auth",
            data: {
                userId: (dataUser.data.userId).toString(),
                nickname: dataUser.data.nickname,
            }
        }))
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('data .....', data)
        if (data.type === 'user_joined') {
            if (addUserToList(data.data.userId)) {
                showNotification(` присоединился к комнате`);
            }
        } else if (data.type === 'room_info') {
            data.users.forEach(user => {
                addUserToList(user.id);
            });
        }
        if (data.type === 'leave_ack' || data.type === 'user_leaved') {
            if (removeUserFromList(data.data.userId)) {
                showNotification(`${data.data.userId}: ${data.data.nickname} вызодит из комнаты...`);
            }
            if (data.type === 'leave_ack') {
                window.location.href = '/main';
            }
        }
        if (data.type === 'start_game') {
            handleGameStart(data, data.data.userId)
        }
        if (data.type === "not_all_ready") {
            showNotification(`Не все игроки нажали кнопку "ГОТОВ"`);
        }
    }
    return socket
}
function removeUserFromList(userId) {
    const userElement = document.getElementById(`user-${userId}`);
    if (userElement) {
        userElement.remove();
        return true;
    }
    return false;
}
function addUserToList(userId) {
    const userList = document.querySelector('.user-list');
    if (!document.getElementById(`user-${userId}`)) {
        const userElement = document.createElement('div');
        userElement.id = `user-${userId}`;
        userElement.innerHTML = `
            <p>ID: ${ userId }</p>
        `
        userList.appendChild(userElement);
        return true
    }
    return false
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function handleGameStart(data, userId) {
    sessionStorage.setItem('gameSession', JSON.stringify({
        userId: userId,
        gameId: data.data.gameId,
        gameType: data.data.gameType,
    }))
    let countStart = 2
    const countStartElt = document.createElement("div")
    document.body.appendChild(countStartElt)
    const timer = setInterval(() => {
        countStartElt.textContent = `Переход в игру через ${countStart}`
        countStart--
        if (countStart < 0) {
            clearInterval(timer)
            window.location.href = `/game/index.html?gameId=${data.data.gameId}`
        }
    }, 1000)
}

