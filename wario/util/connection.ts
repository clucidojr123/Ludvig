import express, { Response } from "express";

declare module "express-session" {
    interface SessionData {
        cookie: Cookie;
        passport: any;
        lastModified: Date;
        connections: string[];
    }
}

interface Connection {
    uid: string;
    docid: string;
    stream: express.Response;
}

class CurrentConnections {
    data: Connection[];

    constructor() {
        this.data = [];
    }

    addConnection(docid: string, uid: string, res: Response) {
        this.data.push({ uid, docid, stream: res });
    }

    endDocConnections(docid: string) {
        this.data.forEach((val) => {
            if (val.docid === docid && !val.stream.writableEnded) {
                val.stream.end();
            }
        });
    }

    endUIDConnection(uid: string) {
        this.data = this.data.filter((val) => {
            if (val.uid === uid) {
                if (!val.stream.writableEnded) {
                    val.stream.end();
                }
                return false;
            }
            return true;
        });
    }
}

export const connectionStore = new CurrentConnections();
