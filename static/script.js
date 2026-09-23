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

function socketOnOpen(event){
    console.log("WebSocket initialized and connected");
}

function socketOnMessage(event){
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
const socket = new WebSocket(`ws://${host}/ws/system-stats`);

socket.onopen = socketOnOpen;
socket.onmessage = socketOnMessage;
socket.onclose = function(event) {
    console.warn("WebSocket spojenie bolo prerušené.");
};
socket.onerror = function(error) {
    console.error("WebSocket error: ", error);
};





