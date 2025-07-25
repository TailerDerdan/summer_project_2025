document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadUsersData()
    const users = data["users"]
    users.forEach((user) => {
        console.log("///")
        if (user["roomId"] !== null) {
            console.log("tyt")
            addUser(user)
        }
    })
})
async function loadUsersData() {
    const response = await fetch('/main/getUsers', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json()
}
