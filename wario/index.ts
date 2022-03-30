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
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

const PORT = process.env.PORT || 3001;

// Register Quill-Delta OT Type with ShareDB
ShareDB.types.register(richText.type);

async function main() {
    // Express Web Server
    const app = express();
    const server = http.createServer(app);

    // const testDel = new Delta([
    //     { retain: 5 }, { insert: "a" },
    //     { retain: 4 }, { delete: 10 },
    //     { insert: "Hello", attributes: { bold: true } },
    // ]);

    // Initialize ShareDB
    const share = new ShareDB();
    // Server-side connection used within grading script routes
    const connection = share.connect();

    // Connect incoming WebSocket connections to ShareDB
    const wss = new WebSocket.Server({ server: server });
    wss.on("connection", (ws) => {
        const stream = new WebSocketJSONStream(ws);
        share.listen(stream);
    });

    app.use(cors());

    app.use(function (req, res, next) {
        res.setHeader('X-CSE356', '62030fd851710446f0836f62');
        next();
    });

    app.use(express.json());

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("gigabossofswag");
        return next();
    });

    // CUSTOM ROUTES FOR GRADING SCRIPT
    app.get("/connect/:id", async (req, res) => {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        const doc = connection.get("documents", req.params.id);
        await subscribeDocument(doc, [], "rich-text");
        res.write(`data: ${JSON.stringify({ content: doc.data.ops })}\n\n`);
        doc.on("op", () => {
            res.write(`data: ${JSON.stringify(doc.data.ops)}\n\n`);
        });
        console.log(`Connected To Doc: ${req.params.id}\n`);
    });

    app.post("/op/:id", async (req, res) => {
        const doc = connection.get("documents", req.params.id);
        await fetchDocument(doc);
        if (doc.type && Array.isArray(req.body)) {
            console.log(`Submitting Ops to ${req.params.id}: \n${JSON.stringify(req.body)}\n`);
            req.body.forEach(async (val) => {
                await submitOp(doc, val);
            });
            res.status(200).send("Success").end();
        } else {
            res.status(400).end();
        }
    });

    app.get("/doc/:id", async (req, res) => {
        const doc = connection.get("documents", req.params.id);
        await fetchDocument(doc);
        if (doc.type) {
            console.log(`Fetched Doc: ${req.params.id}\nFetched Ops: ${JSON.stringify(doc.data.ops)}\n`);
            const result = new QuillDeltaToHtmlConverter(doc.data.ops);
            let rendered = result.convert();
            if (!rendered) {
                rendered = "<p></p>";
            }
            res.send(rendered).end();
        } else {
            res.status(400).end();
        }
    });
    // END CUSTOM ROUTES FOR GRADING SCRIPT

    server.listen(PORT);
    console.log(`🚀 Wario (ShareDB Server) now listening on port ${PORT}`);
}

const subscribeDocument = (doc: ShareDB.Doc, createData: any, type: string) => {
    return new Promise<void>((resolve, reject) => {
        doc.subscribe((error) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            // If doc.type is undefined, the document has not been created
            if (!doc.type) {
                // @ts-ignore
                doc.create(createData, type, (error) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    }
                    resolve();
                    return;
                });
            }
            resolve();
            return;
        });
    });
};

const fetchDocument = (doc: ShareDB.Doc) => {
    return new Promise<void>((resolve, reject) => {
        doc.fetch((error) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

const submitOp = (doc: ShareDB.Doc, data: any) => {
    return new Promise<void>((resolve, reject) => {
        doc.submitOp(data, {}, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

main().catch((err) => console.log(err));
