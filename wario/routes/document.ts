import express from "express";
import { generateHTML, ShareDBConnection } from "../util/sharedb";
import { connectionStore } from "../util/connection";
import { isAuthenticated, isVerified } from "../util/passport";
import { IUser } from "../models/user";

const router = express.Router();

router.get(
    "/connect/:docid/:uid",
    isAuthenticated,
    isVerified,
    async (req, res) => {
        const { docid, uid } = req.params;
        if (!docid || !uid) {
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid route parameters",
                })
                .end();
            return;
        }
        const doc = ShareDBConnection.get("documents", docid);
        doc.fetch((err) => {
            // If there is no doc with specified id
            if (!doc.type) {
                res.status(400)
                    .json({
                        error: true,
                        message: "No document exists with specified docid",
                    })
                    .end();
                return;
            }
            // Check if there's any exisiting connection
            let connect = connectionStore.data.find(
                (val) => val.uid === req.params.uid
            );
            if (!connect) {
                connect = {
                    uid: req.params.uid,
                    docid: req.params.docid,
                    stream: res,
                };
                connectionStore.data.push(connect);
            } else {
                res.status(400)
                    .json({
                        error: true,
                        message: "Repeat UID",
                    })
                    .end();
                return;
            }
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });
            res.flushHeaders();
            res.write(
                `data: ${JSON.stringify({
                    content: doc.data.ops,
                    version: doc.version,
                })}\n\n`
            );
            res.on("close", () => {
                console.log(`Closing Connection: ${req.params.uid}\n`);
                connectionStore.endUIDConnection(uid, docid);
            });
            console.log(`Connected To Doc: ${req.params.uid}\n`);
        });
    }
);

router.post(
    "/op/:docid/:uid",
    isAuthenticated,
    isVerified,
    async (req, res) => {
        // VALIDATE ROUTE PARAMS
        const { docid, uid } = req.params;
        if (!docid || !uid) {
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid route parameters",
                })
                .end();
            return;
        }
        // GET CONNECTION WITH SPECIFIED UID
        let connect = connectionStore.data.find(
            (val) => val.uid === req.params.uid
        );
        if (!connect) {
            res.status(400)
                .json({
                    error: true,
                    message: "No connection with UID found",
                })
                .end();
            return;
        } else {
            // SANITY CHECK FOR OP AND VERSION
            const { op, version } = req.body;
            if (!op || version === undefined) {
                res.status(400)
                    .json({
                        error: true,
                        message: "Invalid request body",
                    })
                    .end();
                return;
            }
            // FETCH DOC WITH DOCID
            const doc = ShareDBConnection.get("documents", docid);
            doc.fetch((err) => {
                // CHECK THAT DOC EXISTS
                if (doc.type) {
                    // IF VERSIONS DON'T MATCH
                    if (!doc.version || doc.version !== version) {
                        res.status(400)
                            .json({
                                status: "retry",
                            })
                            .end();
                        return;
                    }
                    console.log(
                        `Submitting Ops from ${uid}: \n${JSON.stringify(
                            req.body
                        )}\n`
                    );
                    // SUBMIT OP
                    doc.submitOp(op, {}, (err) => {
                        if (err) {
                            console.log(err.message);
                        }
                        connectionStore.data.forEach((val) => {
                            // CURRENT CONNECTION
                            if (val.uid === uid && !val.stream.writableEnded) {
                                console.log(`Sending ACK to ${val.uid}\n`);
                                val.stream.write(
                                    `data: ${JSON.stringify({ ack: op })}\n\n`
                                );
                            }
                            // SEND OPS TO OTHER CONNECTIONS
                            else if (
                                !val.stream.writableEnded &&
                                val.uid !== uid &&
                                val.docid === docid
                            ) {
                                console.log(`Sending OPS to ${val.uid}\n`);
                                val.stream.write(
                                    `data: ${JSON.stringify(op)}\n\n`
                                );
                            }
                        });
                        res.status(200).json({ status: "ok" }).end();
                    });
                } else {
                    res.status(400)
                        .json({
                            error: true,
                            message: "Unable to fetch doc",
                        })
                        .end();
                    return;
                }
            });
        }
    }
);

router.post(
    "/presence/:docid/:uid",
    isAuthenticated,
    isVerified,
    async (req, res) => {
        // VALIDATE ROUTE PARAMS
        const { docid, uid } = req.params;
        if (!docid || !uid) {
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid route parameters",
                })
                .end();
            return;
        }
        // GET CONNECTION WITH SPECIFIED UID
        let connect = connectionStore.data.find(
            (val) => val.uid === req.params.uid
        );
        if (!connect) {
            res.status(400)
                .json({
                    error: true,
                    message: "No connection with UID found",
                })
                .end();
            return;
        } else {
            // SANITY CHECK FOR INDEX AND LENGTH
            const { index, length } = req.body;
            if (index === undefined || length === undefined) {
                res.status(400)
                    .json({
                        error: true,
                        message: "Invalid request body",
                    })
                    .end();
                return;
            }
            const docPresence = ShareDBConnection.getDocPresence(
                "documents",
                docid
            );
            const localPresence = docPresence.create(uid);
            localPresence.submit({ index, length }, (err) => {
                if (err) {
                    res.status(400)
                        .json({
                            error: true,
                            message: "Error trying to submit presence",
                        })
                        .end();
                    return;
                } else {
                    const user = req.user as IUser;
                    connectionStore.data.forEach((val) => {
                        // SEND PRESENCE TO OTHER CONNECTIONS
                        if (
                            !val.stream.writableEnded &&
                            val.uid !== uid &&
                            val.docid === docid
                        ) {
                            console.log(`Sending PRESENCE to ${val.uid}\n`);
                            val.stream.write(
                                `data: ${JSON.stringify({
                                    presence: {
                                        id: uid,
                                        cursor: {
                                            index,
                                            length,
                                            name: user.name,
                                        },
                                    },
                                })}\n\n`
                            );
                        }
                    });
                }
            });
        }
    }
);

router.get(
    "/get/:docid/:uid",
    isAuthenticated,
    isVerified,
    async (req, res) => {
        // VALIDATE ROUTE PARAMS
        const { docid, uid } = req.params;
        if (!docid || !uid) {
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid route parameters",
                })
                .end();
            return;
        }
        // GET CONNECTION WITH SPECIFIED UID
        let connect = connectionStore.data.find(
            (val) => val.uid === req.params.uid
        );
        if (!connect) {
            res.status(400)
                .json({
                    error: true,
                    message: "No connection with UID found",
                })
                .end();
            return;
        } else {
            // FETCH DOC WITH DOCID
            const doc = ShareDBConnection.get("documents", docid);
            doc.fetch((err) => {
                // CHECK THAT DOC EXISTS
                if (doc.type) {
                    console.log(
                        `Fetched Doc: ${
                            req.params.id
                        }\nFetched Ops: ${JSON.stringify(doc.data.ops)}\n`
                    );
                    const result = generateHTML(doc);
                    res.send(result).end();
                } else {
                    res.status(400)
                        .json({
                            error: true,
                            message: "Unable to fetch doc",
                        })
                        .end();
                    return;
                }
            });
        }
    }
);

export default router;
