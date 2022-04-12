import http from "http";
import cors from "cors";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import userRouter from "./routes/user";
import documentRouter from "./routes/document";
import collectionRouter from "./routes/collection";
import { nanoid } from "nanoid";
import passport from "./util/passport";

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/ludvig";

async function main() {
    const app = express();
    const server = http.createServer(app);

    await mongoose.connect(MONGO_URI);

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
        res.send("gigabossofswag-wario").end();
    });

    // Add routes
    app.use("/users", userRouter);
    app.use("/collection", collectionRouter);
    app.use("/doc", documentRouter);

    // Start Server
    server.listen(PORT);
    console.log(
        `🚀 Wario (Express Backend Server) now listening on port ${PORT}`
    );
}

main().catch((err) => console.log(err));
