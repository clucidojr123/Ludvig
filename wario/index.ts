import http from "http";
import cors from "cors";
import express from "express";
import Delta from "quill-delta";
import session from "express-session";
import MongoStore from "connect-mongo";
import { ShareDBConnection } from "./util/sharedb";
import userRouter from "./routes/user";
import documentRouter from "./routes/document";

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/ludvig";

async function main() {
    const app = express();
    const server = http.createServer(app);

    app.use(cors({
        exposedHeaders: ["Content-Type", "Cache-Control", "Connection", "X-CSE356"],
        credentials: true,
    }));

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

    // TODO get rid of this
    const doc = ShareDBConnection.get("documents", "test");
    doc.fetch((err) => {
        // If doc.type is undefined, the document has not been created
        if (err) {
            console.error(err);
            return;
        }
        if (!doc.type) {
            doc.create(new Delta([{ insert: "" }]), "rich-text", (error) => {
                if (error) {
                    console.error(error);
                    return;
                }
            });
        }
    });
    // END of get rid of this

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("gigabossofswag-wario").end();
    });

    // Add routes
    app.use("/", userRouter);
    app.use("/", documentRouter);

    // Start HTTP Server
    server.listen(PORT);
    console.log(
        `🚀 Wario (Express Backend Server) now listening on port ${PORT}`
    );
}

main().catch((err) => console.log(err));
