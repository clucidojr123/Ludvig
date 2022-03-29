import http from "http";
import express from "express";
import ShareDB from "sharedb";
import WebSocket from "ws";
// @ts-ignore -- no type declarations available at the moment
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
// @ts-ignore -- no type declarations available at the moment
import richText from "rich-text";

const PORT = 3001;

// Register Quill-Delta OT Type with ShareDB
ShareDB.types.register(richText.type);

async function main() {
    // Express Web Server
    const app = express();
    const server = http.createServer(app);

    // Initialize ShareDB
    const share = new ShareDB();

    // Connect incoming WebSocket connections to ShareDB
    const wss = new WebSocket.Server({ server: server });
    wss.on('connection', (ws) => {
        const stream = new WebSocketJSONStream(ws);
        share.listen(stream);
    });

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("Hello World");
        return next();
    })

    server.listen(PORT);
    console.log(`🚀 Wario (ShareDB Server) now listening on port ${PORT}`);
}

main().catch(err => console.log(err));