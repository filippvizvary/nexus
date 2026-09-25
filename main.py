import uvicorn
import docker
import asyncio
import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def get_dashboard():
    return FileResponse("index.html")

# 2. WebSocket spojenie pre živé dáta
@app.websocket("/ws/system-stats")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[+] Dashboard sa pripojil na WebSocket")
    try:
        while True:
            # Načítame aktuálne štatistiky z PC
            stats = {
                "cpu": psutil.cpu_percent(interval=None),
                "ram": psutil.virtual_memory().percent,
                "disk": psutil.disk_usage('/').percent
            }
            # Pošleme ich do prehliadača ako JSON
            await websocket.send_json(stats)
            
            # Počkáme 1 sekundu pred ďalším poslaním
            await asyncio.sleep(0.5)
            
    except WebSocketDisconnect:
        print("[-] Dashboard sa odpojil")

def fetch_docker_containers():
    """Synchrónna funkcia na získanie Docker dát."""
    client = docker.from_env()
    containers = []
    for container in client.containers.list(all=True):
        containers.append({
            "id": container.short_id,
            "name": container.name,
            "status": container.status,
            "image": container.image.tags[0] if container.image.tags else "N/A"
        })
    return containers

@app.websocket("/ws/docker")
async def websocket_docker(websocket: WebSocket):
    await websocket.accept()
    print("[+] Dashboard connected to Docker WebSocket")
    
    try:
        while True:
            # Spustíme synchrónne Docker volanie vo vedľajšom vlákne
            containers = await asyncio.to_thread(fetch_docker_containers)
            
            # Odosleme dáta na frontend
            await websocket.send_json({"containers": containers})
            
            # Dôležité: Čakáme 2 sekundy pred ďalšou kontrolou (Docker sa nemení každú milisekundu)
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        print("[-] Dashboard disconnected from Docker WebSocket")
            




if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)