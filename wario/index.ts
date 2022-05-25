import http from "http";
import cors from "cors";
import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import mongoose from "mongoose";
import userRouter from "./routes/user";
import documentRouter from "./routes/document";
import collectionRouter from "./routes/collection";
import mediaRouter from "./routes/media";
import { nanoid } from "nanoid";
import passport from "./util/passport";
import * as Minio from "minio";
import { S3Instance, customPolicy } from "./util/s3";
import { RedisInstance } from "./util/redis";

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:49153/ludvig";
const S3_URI = process.env.S3_URI || "localhost";
const RedisStore = connectRedis(session);

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
    if (!bucketExists && PORT === "3001") {
        await minioClient.makeBucket("doc-media", "us-east-1");
        await minioClient.setBucketPolicy(
            "doc-media",
            JSON.stringify(customPolicy)
        );
    }

    S3Instance.initialize(minioClient);

    RedisInstance.on('error', (err) => console.log('Redis Client Error', err));
    await RedisInstance.connect().catch(console.error);

    // Enable CORS and expose needed headers
    app.use(
        cors({
            exposedHeaders: ["Content-Type", "Cache-Control", "Connection"],
            origin: true,
            credentials: true,
        })
    );

    app.use(express.json({ limit: "10MB" }));
    app.use(
        express.urlencoded({
            extended: true,
            limit: "10MB",
        })
    );

    // Set up sessions
    app.use(
        session({
            genid: () => nanoid(),
            resave: false,
            saveUninitialized: false,
            secret: "Archibald Castillo",
            store: new RedisStore({ client: RedisInstance }),
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Add routes
    app.use("/users", userRouter);
    app.use("/collection", collectionRouter);
    app.use("/doc", documentRouter);
    app.use("/media", mediaRouter);

    app.get("/", (req, res) => {
        res.send("Hello World").end();
    })

    // Start Server
    server.listen(PORT);
    console.log(
        `🚀 Wario (Express Backend Server) now listening on port ${PORT}`
    );
}

main().catch((err) => console.log(err));
