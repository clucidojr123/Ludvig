import ShareDB from "sharedb/lib/client";
import ReconnectingWebSocket from "reconnecting-websocket";

export class SDoc<T> {
    connection: ShareDB.Connection;
    doc: ShareDB.Doc<T>;

    constructor(collection: string, id: string) {
        const socket = new ReconnectingWebSocket(
            "ws://localhost:3001",
            [],
            {
                WebSocket: WebSocket,
            }
        );
        // @ts-ignore
        this.connection = new ShareDB.Connection(socket);
        this.doc = this.connection.get(collection, id) as ShareDB.Doc<T>;
    }

    subscribeDocument(createData: T) {
        return new Promise<void>((resolve, reject) => {
            this.doc.subscribe((error) => {
                if (error) {
                    console.error(error);
                    reject(error);
                }
                // If doc.type is undefined, the document has not been created
                if (!this.doc.type) {
                    this.doc.create(createData, (error) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                        }
                    });
                }
                resolve();
            });
        });
    }

    submitOp(data: any) {
        return new Promise<void>((resolve, reject) => {
            this.doc.submitOp(data, {}, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    setDocOnOp(callback: (() => void)) {
        this.doc.on("op", callback);
    }
}