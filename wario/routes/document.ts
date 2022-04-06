import express from "express";
import {
    currentConnections,
    generateHTML,
    ShareDBConnection,
} from "../util/sharedb";

const router = express.Router();

router.get("/connect/:id", async (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    res.flushHeaders();
    let connect = currentConnections.find((val) => val.name === req.params.id);
    if (!connect) {
        connect = {
            name: req.params.id,
            stream: res,
        };
        currentConnections.push(connect);
    } else {
        connect.stream = res;
    }
    const doc = ShareDBConnection.get("documents", "test");
    doc.fetch((err) => {
        res.write(`data: ${JSON.stringify({ content: doc.data.ops })}\n\n`);
        res.on("close", () => {
            // TODO find way to filter
            currentConnections.forEach((val) => {
                if (val.name === req.params.id) {
                    console.log(`Closing connection: ${req.params.id}\n`);
                    val.stream.end();
                    return;
                }
                return;
            });
        });
        console.log(`Connected To Doc: ${req.params.id}\n`);
    });
});

router.post("/op/:id", async (req, res) => {
    let connect = currentConnections.find((val) => val.name === req.params.id);
    if (!connect) {
        res.status(400).end();
    } else {
        const doc = ShareDBConnection.get("documents", "test");
        doc.fetch((err) => {
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
                    if (
                        !val.stream.writableEnded &&
                        val.name !== req.params.id
                    ) {
                        console.log(`Sending Ops to ${val.name}\n`);
                        val.stream.write(
                            `data: ${JSON.stringify(req.body)}\n\n`
                        );
                    }
                });
                res.status(200).send("Success").end();
            } else {
                res.status(400).end();
            }
        });
    }
});

router.get("/doc/:id", async (req, res) => {
    let connect = currentConnections.find((val) => val.name === req.params.id);
    if (!connect) {
        res.status(400).end();
    } else {
        const doc = ShareDBConnection.get("documents", "test");
        doc.fetch((err) => {
            if (doc.type) {
                console.log(
                    `Fetched Doc: ${
                        req.params.id
                    }\nFetched Ops: ${JSON.stringify(doc.data.ops)}\n`
                );
                const result = generateHTML(doc);
                res.send(result).end();
            } else {
                res.status(400).end();
            }
        });
    }
});

export default router;
