document.addEventListener("DOMContentLoaded", async () => {
    const roomSet = JSON.parse(sessionStorage.getItem('roomSettings'));
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
    console.log("dataJson: ", dataJson, "roomSet: ", roomSet)
    const users = dataJson["users"]
    users.forEach((user) => {
        if (user["roomId"] && user["roomId"].toString() === roomSet["roomId"].toString()) {
            addUserLocal(user)
        }
    })
})

function addUserLocal(user) {
    console.log("user.isReady", user.isReady, typeof user.isReady)
    const userList = document.querySelector(`.room-info__main-indicator-bar`)
    if (userList &&  !document.getElementById(`user-${user.userId}`)) {
        const userElt = document.createElement("p")
        if (user.isReady) {
            userElt.setAttribute("style", "background-color: green;")
        } else {
            userElt.setAttribute("style", "background-color: red;")
        }
        userElt.id = `user-${user.userId}`
        userElt.textContent = `${user.userId}: ${user.nickname}`
        userList.appendChild(userElt)
    }
}
