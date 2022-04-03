import React, { useState, useEffect } from "react";
import "quill/dist/quill.snow.css";
import { useQuill } from "react-quilljs";
import Delta, { Op } from "quill-delta";
import { nanoid } from "nanoid";
import { debounce } from "throttle-debounce";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const Document = () => {
    const [connectID, setConnectID] = useState<string>(nanoid());
    const [queue, setQueue] = useState<Op[][]>([]);
    const { quill, quillRef } = useQuill();

    const sendData = debounce(300, async () => {
        if (queue.length) {
            console.log("Sending ops");
            await fetch(`${WARIO_URI}/op/${connectID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: `${JSON.stringify(queue)}`,
            });
            setQueue([]);
        }
    });

    const handleNewData = (e: MessageEvent<any>) => {
        const data = JSON.parse(e.data);
        if (!data || !quill) {
            console.log(
                "Recieved message with undefined data or quill is undefined!"
            );
        } else if (data.content) {
            console.log("Recieved Initial Ops");
            quill.setContents(new Delta(data.content));
        } else if (Array.isArray(data)) {
            console.log("Recieved New Ops");
            const newDeltas = data as Array<Op[]>;
            newDeltas.forEach((val) => {
                quill.updateContents(new Delta(val));
            });
        }
    };

    useEffect(() => {
        if (quill) {
            console.log("Connection ID: " + connectID);
            const evInstance = new EventSource(
                `http://localhost:3001/connect/${connectID}`
            );
            evInstance.onmessage = handleNewData;
            window.addEventListener("beforeunload", () => {
                evInstance.close();
            });
            quill.on(
                "text-change",
                function (delta: Delta, oldDelta: Delta, source: string) {
                    if (source === "user") {
                        const current: Delta = quill.getContents();
                        queue.push(oldDelta.diff(current).ops);
                        sendData();
                    }
                }
            );
        }
    }, [quill]);

    return (
        <div>
            <div>
                <div ref={quillRef} />
            </div>
        </div>
    );
};

export default Document;
