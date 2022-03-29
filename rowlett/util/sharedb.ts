import ShareDB from "sharedb/lib/client";
import ReconnectingWebSocket from "reconnecting-websocket";
import Delta from "quill-delta";
import Op from "quill-delta/dist/Op";

// Configure Quill-Delta as an OT Type
type InitDelta = Op[] | { ops: Op[] };
const DeltaOT = {
    Delta: Delta,
    type: {
        name: "ludvig",
        uri: "https://github.com/clucidojr123",
        create: (initial: InitDelta) => {
            return new Delta(initial);
        },
        apply: (snapshotInput: InitDelta, deltaInput: InitDelta) => {
            const snapshot = new Delta(snapshotInput);
            const delta = new Delta(deltaInput);
            return snapshot.compose(delta);
        },
        compose: (delta1Input: InitDelta, delta2Input: InitDelta) => {
            const delta1 = new Delta(delta1Input);
            const delta2 = new Delta(delta2Input);
            return delta1.compose(delta2);
        },
        transform: function (
            delta1Input: InitDelta,
            delta2Input: InitDelta,
            side: string
        ) {
            const delta1 = new Delta(delta1Input);
            const delta2 = new Delta(delta2Input);
            // Fuzzer specs is in opposite order of delta interface
            return delta2.transform(delta1, side === "left");
        },
    },
};

// Register Quill-Delta OT Type with ShareDB
ShareDB.types.register(DeltaOT.type);

export class SDoc<T> {
    connection: ShareDB.Connection;
    doc: ShareDB.Doc<T>;
    type: string;

    constructor(collection: string, id: string, type: string) {
        const wsInstance = new ReconnectingWebSocket(
            "ws://localhost:3001",
            [],
            {
                WebSocket: WebSocket,
            }
        );
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
                    // @ts-ignore
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
