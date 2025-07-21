document.addEventListener("DOMContentLoaded", async () => {
    const roomSet = JSON.parse(sessionStorage.getItem('roomSettings'));
    if (roomSet) {
        if (roomSet.userId) {
            const startBtn = document.createElement("button")
            startBtn.className = ("start-btn")
            startBtn.textContent = "Играть"
            startBtn.type = "submit"
            document.body.appendChild(startBtn)
        }
    }
    //sessionStorage.removeItem('roomSettings');

    const response = await fetch('/room/getUsers', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const dataJson = await response.json()
    const users = dataJson["users"]
    users.forEach((user) => {
        if (user["roomId"] === roomSet["roomId"]) {
            addUserLocal(user)
        }
    })
})

function addUserLocal(user) {
    const userList = document.getElementById(`users-list-${user.roomId}`)
    if (userList &&  !document.getElementById(`user-${user.userId}`)) {
        const userElt = document.createElement("p")
        userElt.id = `user-${user.userId}`
        userElt.textContent = `${user.userId}: ${user.nickname}`
        userList.appendChild(userElt)
    }
}
