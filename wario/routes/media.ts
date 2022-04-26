import express, { Request, Response, NextFunction } from "express";
import { isAuthenticated, isVerified } from "../util/passport";
import multer from "multer";
import { nanoid } from "nanoid";
import { IUser } from "../models/user";
import fileType from "file-type";
import { S3Instance } from "../util/s3";
import fetch from 'node-fetch';

const router = express.Router();

const ALLOWED_FILE_TYPES = ["jpeg", "jpg", "png", "gif"];

const upload = (req: Request, res: Response, next: NextFunction) => {
    multer().single("file")(req, res, (err) => {
        if (err)
            res.status(400)
                .json({
                    error: true,
                    message: "multer upload error",
                })
                .end();
        else return next();
    });
};

router.post(
    "/upload",
    isAuthenticated,
    isVerified,
    upload,
    async (req, res, next) => {
        const user = req.user as IUser;

        const file = req.file;
        if (!file) {
            res.status(400)
                .json({
                    error: true,
                    message: "no image found",
                })
                .end();
            return next();
        }

        // Check file type and get correct file extension
        let fileExt = "";
        let mimeType = "";
        const fType = await fileType.fromBuffer(file.buffer);
        if (!fType || !ALLOWED_FILE_TYPES.includes(fType.ext)) {
            if (fType) {
                console.log(fType);
            }
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid file type.",
                })
                .end();
            return next();
        }

        fileExt = fType.ext;
        mimeType = fType.mime;

        const mediaid = nanoid();
        const fileName = `${mediaid}.${fileExt}`;

        await S3Instance.putObject("doc-media", fileName, file.buffer, {
            "Content-Type": mimeType,
        });

        res.status(200).json({ mediaid: fileName }).end();
        return next();
    }
);

router.get(
    "/access/:mediaid",
    isAuthenticated,
    isVerified,
    async (req, res) => {
        const result = await fetch(
            `http://${process.env.S3_URI || "localhost"}:9000/doc-media/${req.params.mediaid}`,
            {
                method: "GET",
            }
        );
        if (result.status !== 200) {
            res.status(400)
                .json({
                    error: true,
                    message: "Invalid Media ID",
                })
                .end();
        } else {
            const data = await result.buffer();
            res.writeHead(200, {"Content-Type": result.headers.get("Content-Type") || "application/json"});
            res.write(data);
            res.end();
        }
    }
);

export default router;
