import { useState, useEffect } from "react";
import "quill/dist/quill.snow.css";
import { useQuill } from "react-quilljs";
import Delta, { Op } from "quill-delta";
import { nanoid } from "nanoid";
import { debounce } from "throttle-debounce";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

// Quill Modules
const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
    ],
};

const Document = () => {
    const [connectID] = useState<string>(nanoid());
    const [queue, setQueue] = useState<Op[][]>([]);
    const { quill, quillRef } = useQuill({ modules });

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
            queue.length = 0;
        }
    });

    const handleIncomingData = (e: MessageEvent<any>) => {
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

    const onTextChange = (delta: Delta, oldDelta: Delta, source: string) => {
        if (source === "user") {
            const current: Delta = quill.getContents();
            queue.push(oldDelta.diff(current).ops);
            sendData();
        }
    };

    useEffect(() => {
        if (quill) {
            console.log("Connection ID: " + connectID);
            const evInstance = new EventSource(
                `${WARIO_URI}/connect/${connectID}`
            );
            evInstance.onmessage = handleIncomingData;
            window.addEventListener("beforeunload", () => {
                evInstance.close();
            });
            quill.on("text-change", onTextChange);
        }
    }, [quill]);

    return (
        <div>
            GIGA BOSS (OF SWAG)
            <div>
                <div ref={quillRef} />
            </div>
        </div>
    );
};

export default Document;
