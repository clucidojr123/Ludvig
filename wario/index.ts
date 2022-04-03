import http from "http";
import cors from "cors";
import express from "express";
import Delta from "quill-delta";
// @ts-ignore -- no type declarations available at the moment
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { SDoc, fetchDocument, ShareDBConnection } from "./sharedb";

const PORT = process.env.PORT || 3001;

interface Connection {
    name: string;
    stream: express.Response;
}

async function main() {
    // Express Web Server
    const app = express();
    const server = http.createServer(app);

    let currentConnections: Connection[] = [];

    app.use(
        cors({
            allowedHeaders: ["Content-Type", "Cache-Control", "Connection"],
        })
    );

    app.use(function (req, res, next) {
        res.setHeader("X-CSE356", "62030fd851710446f0836f62");
        next();
    });

    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: true,
        })
    );

    const initialDoc = new SDoc<Delta>("documents", "swag", "rich-text");
    await initialDoc.subscribeDocument(new Delta([{ insert: "" }]));

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("gigabossofswag-wario");
        return next();
    });

    app.get("/connect/:id", async (req, res) => {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        res.flushHeaders();
        let connect = currentConnections.find(val => val.name === req.params.id);
        if (!connect) {
            connect = {
                name: req.params.id,
                stream: res
            };
            currentConnections.push(connect);
        }
        const doc = ShareDBConnection.get("documents", "swag");
        await fetchDocument(doc);
        res.write(`data: ${JSON.stringify({ content: doc.data.ops })}\n\n`);
        res.on("close", () => {
            currentConnections = currentConnections.filter((val) => {
                if (val.name === req.params.id) {
                    console.log(`Closing connection: ${req.params.id}\n`);
                    return false;
                }
                return true;
            })
        });
        console.log(`Connected To Doc: ${req.params.id}\n`);
    });
    app.post("/op/:id", async (req, res) => {
        let connect = currentConnections.find(val => val.name === req.params.id);
        if (!connect) {
            res.status(400).end();
        } else {
            const doc = ShareDBConnection.get("documents", "swag");
            await fetchDocument(doc);
            if (doc.type && Array.isArray(req.body)) {
                console.log(
                    `Submitting Ops to ${req.params.id}: \n${JSON.stringify(
                        req.body
                    )}\n`
                );
                req.body.forEach((val) => {
                    doc.submitOp(val);
                });
                currentConnections.forEach((val) => {
                    if (!val.stream.writableEnded && val.name !== req.params.id) {
                        console.log(`Sending Ops to ${val.name}`);
                        val.stream.write(`data: ${JSON.stringify(req.body)}\n\n`);
                    }
                });
                res.status(200).send("Success");
            } else {
                res.status(400);
            }
        }
    });

    app.get("/doc/:id", async (req, res) => {
        let connect = currentConnections.find(val => val.name === req.params.id);
        if (!connect) {
            res.status(400).end();
        } else {
            const doc = ShareDBConnection.get("documents", "swag");
            await fetchDocument(doc);
            if (doc.type) {
                console.log(
                    `Fetched Doc: ${req.params.id}\nFetched Ops: ${JSON.stringify(
                        doc.data.ops
                    )}\n`
                );
                const result = new QuillDeltaToHtmlConverter(doc.data.ops);
                let rendered = result.convert();
                if (!rendered) {
                    rendered = "<p></p>";
                }
                res.send(rendered);
            } else {
                res.status(400);
            }
        }
    });

    server.listen(PORT);
    console.log(
        `🚀 Wario (Express Backend Server) now listening on port ${PORT}`
    );
}

main().catch((err) => console.log(err));
