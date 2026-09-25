function showSection(sectionId) {
    // 1. Hide all view sections
    const sections = document.querySelectorAll('.view-section');
    for (const section of sections){
        section.classList.add('hidden');
    };

    // 2. Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // 3. Update active highlight state on menu buttons
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    event.target.classList.add('active');
}

function statSocketOnOpen(event){
    console.log("WebSocket initialized and connected");
}

function statSocketOnMessage(event){
    const data = JSON.parse(event.data);

    const cpuText = document.getElementById("cpu-text");
    const cpuBar = document.getElementById("cpu-bar");
    if (cpuText && cpuBar){
        cpuText.innerText = data.cpu + "%"
        cpuBar.value = data.cpu;
    }

    const ramText = document.getElementById("ram-text");
    const ramBar = document.getElementById("ram-bar");
    if (ramText && ramBar){
        ramText.innerText = data.ram + "%";
        ramBar.value = data.ram
    }

    const diskText = document.getElementById("disk-text");
    const diskBar = document.getElementById("disk-bar");
    if (diskText && diskBar){
        diskText.innerText = data.disk + "%";
        diskBar.value = data.disk
    }
    
}


const host = window.location.host;
const statSocket = new WebSocket(`ws://${host}/ws/system-stats`);
statSocket.onopen = statSocketOnOpen;
statSocket.onmessage = statSocketOnMessage;
statSocket.onclose = function(event) {
    console.warn("WebSocket spojenie bolo prerušené.");
};
statSocket.onerror = function(error) {
    console.error("WebSocket error: ", error);
};

const dockerSocket = new WebSocket(`ws://${host}/ws/docker`);
dockerSocket.onopen = function(event){
    console.log("Docker WebSocket initialized and connected");
};

dockerSocket.onmessage = function(event){
    const servicesList = JSON.parse(event.data).containers;
    const tbody = document.getElementById("docker-list-body");
tbody.innerHTML = ''; // clear old rows first

for (const service of servicesList) {
    const isRunning = service.status.toLowerCase() === 'running';

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${service.id}</td>
        <td>${service.name}</td>
        <td>${service.image}</td>
        <td><span class="status ${service.status.toLowerCase()}">${service.status}</span></td>
        <td>
            <button type="button" data-action="${isRunning ? 'stop' : 'start'}" data-id="${service.id}">
                ${isRunning ? 'Stop' : 'Start'}
            </button>
            <button type="button" data-action="restart" data-id="${service.id}">Restart</button>
        </td>
    `;
    tbody.appendChild(tr);
}
};





