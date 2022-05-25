import express, { Response } from "express";

interface Connection {
    uid: string;
    docid: string;
    stream: express.Response;
}

interface DocData {
    version: number;
    connections: { uid: string, stream: express.Response }[];
}

export const DataStore : Record<string, DocData> = {};

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

    endUIDConnection(uid: string, docid: string) {
        this.data = this.data.filter((val) => {
            if (val.uid === uid) {
                if (!val.stream.writableEnded) {
                    val.stream.end();
                }
                return false;
            } else if (docid === val.docid && !val.stream.writableEnded) {
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
    }
}

export const connectionStore = new CurrentConnections();
