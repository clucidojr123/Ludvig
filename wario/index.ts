import http from "http";
import cors from "cors";
import express from "express";
import Delta from "quill-delta";
// @ts-ignore -- no type declarations available at the moment
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { SDoc } from "./sharedb";

const PORT = process.env.PORT || 3001;

async function main() {
    // Express Web Server
    const app = express();
    const server = http.createServer(app);

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

    const initialDoc = new SDoc<Delta>("documents", "text", "rich-text");
    await initialDoc.subscribeDocument(new Delta([{ insert: "" }]));

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("gigabossofswag-wario");
        return next();
    });

    // SHAREDB COUNTER EXAMPLE
    app.get("/counter", async (req, res, next) => {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        res.flushHeaders();
        // @ts-ignore
        const doc = new SDoc<{ numClicks: number }>("counter", "test", "json0");
        await doc.subscribeDocument({ numClicks: 0 });
        res.write(
            `data: ${JSON.stringify({ numClicks: doc.doc.data.numClicks })}\n\n`
        );
        doc.setDocOnOp(() => {
            res.write(
                `data: ${JSON.stringify({
                    numClicks: doc.doc.data.numClicks,
                })}\n\n`
            );
        });
        console.log("Connected To COUNTER Doc");
    });

    app.post("/counter", async (req, res) => {
        // @ts-ignore
        const doc = new SDoc<{ numClicks: number }>("counter", "test", "json0");
        await doc.subscribeDocument({ numClicks: 0 });
        console.log(JSON.stringify(req.body));
        if (doc.type && Array.isArray(req.body)) {
            console.log("Submitting COUNTER Op");
            await doc.submitOp(req.body);
            res.status(200).send("Success");
        } else {
            res.status(400);
        }
    });
    // END SHAREDB COUNTER EXAMPLE

    app.get("/connect/:id", async (req, res) => {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        const doc = new SDoc<Delta>("documents", "text", "rich-text");
        await doc.subscribeDocument(new Delta([{ insert: "" }]));
        res.write(`data: ${JSON.stringify({ content: doc.doc.data.ops })}\n\n`);
        doc.doc.on("op batch", (op) => {
            res.write(`data: [${JSON.stringify(op)}]\n\n`);
        });
        console.log(`Connected To Doc: ${req.params.id}\n`);
    });

    app.post("/op/:id", async (req, res) => {
        const doc = new SDoc<Delta>("documents", "text", "rich-text");
        await doc.subscribeDocument(new Delta([{ insert: "" }]));
        if (doc.type && Array.isArray(req.body)) {
            console.log(
                `Submitting Ops to ${req.params.id}: \n${JSON.stringify(
                    req.body
                )}\n`
            );
            req.body.forEach(async (val) => {
                await doc.submitOp(val);
            })
            res.status(200).send("Success");
        } else {
            res.status(400);
        }
    });

    app.get("/doc/:id", async (req, res) => {
        const doc = new SDoc<Delta>("documents", "text", "rich-text");
        await doc.subscribeDocument(new Delta([{ insert: "" }]));
        if (doc.type) {
            console.log(
                `Fetched Doc: ${req.params.id}\nFetched Ops: ${JSON.stringify(
                    doc.doc.data.ops
                )}\n`
            );
            const result = new QuillDeltaToHtmlConverter(doc.doc.data.ops);
            let rendered = result.convert();
            if (!rendered) {
                rendered = "<p></p>";
            }
            res.send(rendered);
        } else {
            res.status(400);
        }
    });

    server.listen(PORT);
    console.log(
        `🚀 Wario (Express Backend Server) now listening on port ${PORT}`
    );
}

main().catch((err) => console.log(err));
