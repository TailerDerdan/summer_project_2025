document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector(".button")
    if (!btn) {
        console.error('Кнопка с классом ".button" не найдена');
        return;
    }
    btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const formData = {
            name: document.querySelector(".room-name").value,
            gamemode: document.querySelector(".gamemode").value,
            isOpen: document.querySelector(".is-open").checked
        };
        const response = await fetch('/room/create', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        window.location.href = ('/room/show/' + data.roomId)
    })
})

