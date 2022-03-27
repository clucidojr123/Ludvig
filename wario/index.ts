import express from "express";

async function main() {
    const app = express();
    const PORT = 3001;

    app.get("/", (req, res, next) => {
        res.send("Hello World");
        return next();
    })

    app.listen(PORT, () => {
        console.log(`🚀 Wario (ShareDB Server) now listening on port ${PORT}`);
    });
}

main().catch(err => console.log(err));