import ShareDB from "sharedb/lib/client";
import { OTType } from "sharedb/lib/sharedb";
import ReconnectingWebSocket from "reconnecting-websocket";
// @ts-ignore
import richText from "rich-text";

const wsInstance = new ReconnectingWebSocket(
    "ws://localhost:3001",
    [],
    {
        WebSocket: WebSocket,
    }
);

ShareDB.types.register(richText.type);

export class SDoc<T> {
    connection: ShareDB.Connection;
    doc: ShareDB.Doc<T>;
    type: OTType;

    constructor(collection: string, id: string, type: OTType) {
        // @ts-ignore
        this.connection = new ShareDB.Connection(wsInstance);
        this.doc = this.connection.get(collection, id) as ShareDB.Doc<T>;
        this.type = type;
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
                    this.doc.create(createData, this.type, (error) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                        }
                        resolve();
                        return;
                    });
                }
                resolve();
                return;
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

    setDocOnOp(callback: (ops?: any[], source?: any) => void) {
        this.doc.on("op", callback);
    }
}
