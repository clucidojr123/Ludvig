import http from "http";
import cors from "cors";
import express from "express";
import ShareDB from "sharedb";
import WebSocket from "ws";
// @ts-ignore -- no type declarations available at the moment
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
// @ts-ignore -- no type declarations available at the moment
import richText from "rich-text";
// @ts-ignore
import ShareDBMongo from "sharedb-mongo";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { stripHtml } from "string-strip-html";
import fetch from "node-fetch";
import _ from "lodash";

const PORT = process.env.PORT || 5001;
const ES_URI = process.env.ES_URI || "http://elasticsearch:9200"

// Register Quill-Delta OT Type with ShareDB
ShareDB.types.register(richText.type);

_.mixin({
    memoizeThrottle: function(func, wait=0, options={}) {
      var mem = _.memoize(function() {
        return _.throttle(func, wait, options)
      }, options.resolver);
      // @ts-ignore
      return function(){mem.apply(this, arguments).apply(this, arguments)}
    }
});

const indexDoc = async (docid: string, name: string, ops: any[]) => {
    const result = new QuillDeltaToHtmlConverter(ops);
    const rendered = result.convert();
    const stripped = stripHtml(rendered).result;
    const res = await fetch(`${ES_URI}/ludvig/_doc/${docid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name || "", content: stripped, suggest: stripped.split(" ")  })
    });
    console.log(`Submitted ${name || ""} (${docid}) to ES: ${res.status}`)
}

// @ts-ignore
const throttleIndex = _.memoizeThrottle(indexDoc, 2000);

async function main() {
    // Express Web Server
    const app = express();
    const server = http.createServer(app);

    const db = new ShareDBMongo("mongodb://mongo:27017/ludvig")

    // Initialize ShareDB
    const share = new ShareDB({ db: db, presence: true });

    share.use("afterWrite", async (context, next) => {
        if (context.snapshot?.m?.name && context.snapshot?.data?.ops) {
            throttleIndex(context.snapshot.id, context.snapshot.m.name, context.snapshot.data.ops);
        };
        next();
    });

    // Connect incoming WebSocket connections to ShareDB
    const wss = new WebSocket.Server({ server: server });
    wss.on("connection", (ws) => {
        const stream = new WebSocketJSONStream(ws);
        share.listen(stream);
    });

    app.use(cors());

    // Sanity Check
    app.get("/", (req, res, next) => {
        res.send("gigabossofswag-luigi");
        return next();
    });

    server.listen(PORT);
    console.log(`🚀 Luigi (ShareDB Server) now listening on port ${PORT}`);
}

main().catch((err) => console.log(err));
