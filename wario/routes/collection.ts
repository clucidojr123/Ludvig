import express from "express";
import { ShareDBConnection } from "../util/sharedb";
import mongoose from "mongoose";
import { isAuthenticated, isVerified } from "../util/passport";
import { nanoid } from "nanoid";

const router = express.Router();

router.get("/list", isAuthenticated, isVerified, async (req, res) => {
    const { db } = mongoose.connection;
    const docCollection = db.collection("documents");
    const result = await docCollection.find({}).sort({ "_m.mtime": -1 }).toArray();
    if (result) {
        const docList = result.map((val) => {
            return {
                id: val._id,
                name: val.name,
            };
        });
        res.json(docList).end();
    } else {
        res.status(400)
            .json({
                error: true,
                message: "Unable to retrieve documents",
            })
            .end();
    }
});

router.post("/create", isAuthenticated, isVerified, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400)
            .json({
                error: true,
                message: "Missing id argument in request",
            })
            .end();
        return;
    }
    const { db } = mongoose.connection;
    const docid = nanoid()
    const docCollection = db.collection("documents");
    const doc = ShareDBConnection.get("documents", docid);
    doc.fetch((err) => {
        if (err) {
            res.status(400)
                .json({ error: true, message: "Something Bad Happened" })
                .end();
            console.error(err);
            return;
        }
        // If doc.type is undefined, the document has not been created
        if (!doc.type) {
            doc.create(
                [{ insert: "" }],
                "rich-text",
                async (error) => {
                    if (error) {
                        res.status(400)
                            .json({
                                error: true,
                                message: "Something Bad Happened",
                            })
                            .end();
                        console.error(error);
                        return;
                    }
                    await docCollection.findOneAndUpdate({ _id: docid }, { $set: { name: name } });
                    res.status(200).json({ docid: doc.id }).end();
                    return;
                }
            );
        } else {
            res.status(200).json({ docid: doc.id }).end();
        }
    });
});

router.post("/delete", isAuthenticated, isVerified, async (req, res) => {
    const { docid } = req.body;
    const { db } = mongoose.connection;
    const o_docCollection = db.collection("o_documents");
    const docCollection = db.collection("documents");
    if (!docid) {
        res.status(400)
            .json({
                error: true,
                message: "Missing id argument in request",
            })
            .end();
        return;
    }
    const doc = ShareDBConnection.get("documents", docid);
    doc.fetch((err) => {
        if (err || !doc.type) {
            res.status(400)
                .json({
                    error: true,
                    message: "Unable to delete doc with specified id",
                })
                .end();
            console.error(err);
            return;
        }
        doc.del({}, async (error) => {
            if (error) {
                res.status(400)
                    .json({
                        error: true,
                        message: "Unable to delete doc with specified id",
                    })
                    .end();
                console.error(error);
                return;
            } else {
                await docCollection.deleteOne({ _id: docid });
                await o_docCollection.deleteOne({ d: docid });
                res.status(200).end();
                return;
            }
        });
    });
});

export default router;
