const eventSource = new EventSource('{{ mercure_subscribe_url("timer")|raw }}');
eventSource.onmessage = event => {
    const data = JSON.parse(event.data);
    document.getElementById('time').textContent = data.time;
};

function startTimer() {
    fetch('/timer/start');
}

function stopTimer() {
    fetch('/timer/stop');
}

function resetTimer() {
    fetch('/timer/reset');
}
