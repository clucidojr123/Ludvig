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
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";


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

    share.use("afterWrite", (context, next) => {
        if (context.snapshot?.m?.name) {
            const result = new QuillDeltaToHtmlConverter(context.snapshot.data.ops);
            const rendered = result.convert();
            console.log({ id: context.snapshot.id, name: context.snapshot.m?.name || "", content: rendered  });
        };
        next();
    });

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
