import http from "http";
import cors from "cors";
import express from "express";
import ShareDB from "sharedb";
import WebSocket from "ws";
// @ts-ignore -- no type declarations available at the moment
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
// @ts-ignore -- no type declarations available at the moment
import richText from "rich-text";
import Delta from "quill-delta";
// @ts-ignore
import ShareDBMongo from "sharedb-mongo";


const PORT = process.env.PORT || 5001;

// Register Quill-Delta OT Type with ShareDB
ShareDB.types.register(richText.type);

async function main() {
    // Express Web Server
    const app = express();
    const server = http.createServer(app);

    const db = new ShareDBMongo("mongodb://mongo:27017/ludvig")

    // Initialize ShareDB
    const share = new ShareDB({ db: db, presence: true });

    // Connect incoming WebSocket connections to ShareDB
    const wss = new WebSocket.Server({ server: server });
    wss.on("connection", (ws) => {
        const stream = new WebSocketJSONStream(ws);
        share.listen(stream);
    });

    app.use(cors());

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("gigabossofswag-luigi");
        return next();
    });

    server.listen(PORT);
    console.log(`🚀 Luigi (ShareDB Server) now listening on port ${PORT}`);
}

main().catch((err) => console.log(err));
