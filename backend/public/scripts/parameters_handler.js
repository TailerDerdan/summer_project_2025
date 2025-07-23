const parameters = document.getElementById("parameters");
const btnOpenParameters = document.getElementById("open_parameters");
const btnCloseParameters = document.getElementById("close_parameters");

function openParameters() {
    parameters.style.display = "block";
}

function closeParameters() {
    parameters.style.display = "none";
}

if (btnOpenParameters) btnOpenParameters.addEventListener('click', openParameters);
if (btnCloseParameters) btnCloseParameters.addEventListener('click', closeParameters);
