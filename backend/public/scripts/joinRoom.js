document.addEventListener("DOMContentLoaded", (e) => {
    const connectionData = JSON.parse(sessionStorage.getItem('ws_connection_data'));

    const { roomId, dataJson } = connectionData;
    sessionStorage.removeItem('ws_connection_data');
    const socket = connectToWSRoom(roomId, dataJson)
    document.querySelector('.leave-room-btn').addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "leave_room",
            }));
        }
    });
})
function connectToWSRoom(roomId, dataUser)   {
    const socket = new WebSocket(`ws://localhost:8080/ws/room/${roomId}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "auth",
            dataUser: {
                userId: (dataUser.userId).toString(),
                nickname: (dataUser.nickname).toString(),
            }
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'user_joined') {
            addUserToList(data.userId);
            showNotification(` присоединился к комнате`);
        } else if (data.type === 'room_info') {
            data.users.forEach(user => {
                addUserToList(user.id);
            });
        }
        if (data.type === 'leave_ack' || data.type === 'user_leaved') {
            removeUserFromList(data.userId)
            showNotification(`${data.userId}: ${data.nickname} вызодит из комнаты...`);

            if (data.type === 'leave_ack') {
                window.location.href = '/main';
            }
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
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}


