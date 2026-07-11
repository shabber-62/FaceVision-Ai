from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Maps group IDs (like "class_id" or "global") to lists of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, group: str = "global"):
        await websocket.accept()
        if group not in self.active_connections:
            self.active_connections[group] = []
        self.active_connections[group].append(websocket)

    def disconnect(self, websocket: WebSocket, group: str = "global"):
        if group in self.active_connections:
            if websocket in self.active_connections[group]:
                self.active_connections[group].remove(websocket)
            if not self.active_connections[group]:
                del self.active_connections[group]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict, group: str = "global"):
        if group in self.active_connections:
            for connection in self.active_connections[group]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Stale connection clean up
                    pass

# Singleton instance for application wide usage
manager = ConnectionManager()
