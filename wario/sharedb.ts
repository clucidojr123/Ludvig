import ShareDB from "sharedb/lib/client";
import { OTType } from "sharedb/lib/sharedb";
import WebSocket from "ws";
// @ts-ignore
import richText from "rich-text";

export const wsInstance = new WebSocket(
    "ws://luigi:5001",
);

// @ts-ignore
export const ShareDBConnection = new ShareDB.Connection(wsInstance);

ShareDB.types.register(richText.type);

export class SDoc<T> {
    doc: ShareDB.Doc<T>;
    type: OTType;

    constructor(collection: string, id: string, type: OTType) {
        this.doc = ShareDBConnection.get(collection, id) as ShareDB.Doc<T>;
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
            // console.log(JSON.stringify(this.doc.data));
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

export const fetchDocument = (doc: ShareDB.Doc) => {
    return new Promise<void>((resolve, reject) => {
        doc.fetch((error) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            resolve();
            return;
        });
    });
}
