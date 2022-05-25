import express from "express";
import { generateHTML, ShareDBConnection } from "../util/sharedb";
import { isAuthenticated, isVerified } from "../util/passport";
import { IUser } from "../models/user";
import { DataStore } from "../util/connection";

const router = express.Router();

router.get(
    "/connect/:docid/:uid",
    isAuthenticated,
    isVerified,
    (req, res) => {
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
        doc.fetch(async (err) => {
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
            if (!DataStore[docid]) {
                DataStore[docid] = { version: doc.version || 1, connections: [] }
                doc.on('op', (op, source) => {
                    if (DataStore[docid]) {
                        const { connections } = DataStore[docid];
                        connections.forEach((val) => {
                            if (source === val.uid && !val.stream.writableEnded) {
                                console.log(`Sending ACK to ${val.uid}\n`);
                                val.stream.write(
                                    `data: ${JSON.stringify({ ack: op })}\n\n`
                                );
                            } else if (!val.stream.writableEnded) {
                                console.log(`Sending OPS to ${val.uid}\n`);
                                val.stream.write(
                                    `data: ${JSON.stringify(op)}\n\n`
                                );
                            }
                        })
                    }
                });
            }
            const Store = DataStore[docid];
            let connect = Store.connections.find(
                (val) => val.uid === uid
            )
            if (!connect) {
                connect = {
                    uid,
                    stream: res,
                };
            } else {
                // res.status(400)
                //     .json({
                //         error: true,
                //         message: "Repeat UID",
                //     })
                //     .end();
                // return;
                connect = {
                    uid,
                    stream: res,
                }
            }
            Store.connections.push(connect);
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                'X-Accel-Buffering': 'no'
            });
            res.flushHeaders();
            const initData = JSON.stringify({
                content: doc.data.ops,
                version: Store.version,
            });
            res.write(`data: ${initData}\n\n`);
            res.on("close", () => {
                console.log(`Closing Connection: ${uid}\n`);
                Store.connections = Store.connections.filter((val) => {
                    if (val.uid === uid) {
                        if (!val.stream.writableEnded) {
                            val.stream.end();
                        }
                        return false;
                    } else if (!val.stream.writableEnded) {
                        console.log(`Sending PRESENCE to ${val.uid}\n`);
                        val.stream.write(
                            `data: ${JSON.stringify({
                                presence: {
                                    id: uid,
                                    cursor: null,
                                },
                            })}\n\n`
                        );
                    }
                    return true;
                });
            });
            console.log(`Connected To Doc: ${uid}\n`);
        });
    }
);

router.post(
    "/op/:docid/:uid",
    async (req, res) => {
        // VALIDATE ROUTE PARAMS
        const { docid, uid } = req.params;
        const Store = DataStore[docid];
        if (!docid || !uid) {
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid route parameters",
                })
                .end();
            return;
        }
        if (Store.version === null) {
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
            doc.fetch(async (err) => {
                if (!doc.type || err) {
                    res.status(400)
                    .json({
                        error: true,
                        message: "No document exists with specified docid",
                    })
                    .end();
                    return;
                } else if (Store.version !== version) {
                    res.status(200)
                        .json({
                            status: "retry",
                        })
                        .end();
                    return;
                } else {
                    console.log(
                        `Submitting Ops from ${uid}: \n${JSON.stringify(
                            req.body
                        )}\n`
                    );
                    Store.version++;
                    doc.submitOp(op, { source: uid });
                    res.status(200).json({ status: "ok" }).end();
                    return
                }
            });
        }
    }
);

router.post(
    "/presence/:docid/:uid",
    isAuthenticated,
    isVerified,
    (req, res) => {
        // VALIDATE ROUTE PARAMS
        const { docid, uid } = req.params;
        const Store = DataStore[docid];
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
        let connect = Store.connections.find(
            (val) => val.uid === uid
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
            const user = req.user as IUser;
            Store.connections.forEach((val) => {
                // SEND PRESENCE TO OTHER CONNECTIONS
                if (!val.stream.writableEnded && val.uid !== uid) {
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
            }});
            res.status(200).json({}).end();
            return;
            // const docPresence = ShareDBConnection.getDocPresence(
            //     "documents",
            //     docid
            // );
            // const localPresence = docPresence.create(uid);
            //localPresence.submit({ index, length }, (err) => {
            // if (versionStore[docid] === undefined) {
            //         res.status(400)
            //             .json({
            //                 error: true,
            //                 message: "Error trying to submit presence",
            //             })
            //             .end();
            //         return;
            //     } else {
            //         const user = req.user as IUser;
            //         connectionStore.data.forEach((val) => {
            //             // SEND PRESENCE TO OTHER CONNECTIONS
            //             if (
            //                 !val.stream.writableEnded &&
            //                 val.uid !== uid &&
            //                 val.docid === docid
            //             ) {
            //                 console.log(`Sending PRESENCE to ${val.uid}\n`);
            //                 val.stream.write(
            //                     `data: ${JSON.stringify({
            //                         presence: {
            //                             id: uid,
            //                             cursor: {
            //                                 index,
            //                                 length,
            //                                 name: user.name,
            //                             },
            //                         },
            //                     })}\n\n`
            //                 );
            //             }
            //         });
            //         res.status(200).json({}).end();
            //     }
        }
    }
);

router.get(
    "/get/:docid/:uid",
    isAuthenticated,
    isVerified,
    (req, res) => {
        // VALIDATE ROUTE PARAMS
        const { docid, uid } = req.params;
        const Store = DataStore[docid];
        if (!docid || !uid) {
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid route parameters",
                })
                .end();
            return;
        }
        //GET CONNECTION WITH SPECIFIED UID
        let connect = Store.connections.find(
            (val) => val.uid === uid
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
                if (doc.type && !err) {
                    console.log(
                        `Fetched Doc: ${uid}\nFetched Ops: ${JSON.stringify(doc.data.ops)}\n`
                    );
                    const result = generateHTML(doc);
                    res.send(result).end();
                } else {
                    console.log(err);
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
