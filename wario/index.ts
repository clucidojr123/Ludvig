import http from "http";
import cors from "cors";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import userRouter from "./routes/user";
import documentRouter from "./routes/document";
import collectionRouter from "./routes/collection";
import mediaRouter from "./routes/media";
import { nanoid } from "nanoid";
import passport from "./util/passport";
import * as Minio from 'minio';
import { S3Instance, customPolicy } from "./util/s3";

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ludvig";
const S3_URI = process.env.S3_URI || "localhost";

async function main() {
    const app = express();
    const server = http.createServer(app);

    await mongoose.connect(MONGO_URI);

    const minioClient = new Minio.Client({
        endPoint: S3_URI,
        port: 9000,
        useSSL: false,
        accessKey: "ludvig",
        secretKey: "castillo",
    });

    // Make the bucket if there is none
    const bucketExists = await minioClient.bucketExists("doc-media");
    if (!bucketExists) {
        await minioClient.makeBucket("doc-media", "us-east-1");
        await minioClient.setBucketPolicy('doc-media', JSON.stringify(customPolicy));
    }

    S3Instance.initialize(minioClient);

    // Enable CORS and expose needed headers
    app.use(
        cors({
            exposedHeaders: [
                "Content-Type",
                "Cache-Control",
                "Connection",
                "X-CSE356",
            ],
            origin: true,
            credentials: true,
        })
    );

    // Add CSE 356 Header
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

    // Set up sessions
    app.use(
        session({
            genid: () => nanoid(),
            resave: false,
            saveUninitialized: false,
            secret: "Archibald Castillo",
            store: new MongoStore({
                mongoUrl: MONGO_URI,
                touchAfter: 24 * 3600, // Lazy update session
                ttl: 14 * 24 * 60 * 60, // TTL = 14 Days
            }),
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("gigabossofswag-test").end();
    });

    // Add routes
    app.use("/users", userRouter);
    app.use("/collection", collectionRouter);
    app.use("/doc", documentRouter);
    app.use("/media", mediaRouter);

    // Start Server
    server.listen(PORT);
    console.log(
        `🚀 Wario (Express Backend Server) now listening on port ${PORT}`
    );
}

main().catch((err) => console.log(err));
