import { useState, useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import Delta, { Op } from "quill-delta";
import { nanoid } from "nanoid";
import { debounce } from "throttle-debounce";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const Document = () => {
    const [connectID] = useState<string>(nanoid());
    const [quill, setQuill] = useState<Quill>();
    const quillRef = useRef(null);

    const sendData = async (ops: any[]) => {
        console.log(`Sending Ops: \n${JSON.stringify(ops)}`);
        await fetch(`${WARIO_URI}/op/${connectID}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: `[${JSON.stringify(ops)}]`,
        });
    };

    const handleIncomingData = (e: MessageEvent<any>) => {
        const data = JSON.parse(e.data);
        if (!data || !quill) {
            console.log(
                "Recieved message with undefined data or quill is undefined!"
            );
        } else if (data.content) {
            console.log("Recieved Initial Ops");
            quill.setContents(data.content);
        } else if (Array.isArray(data)) {
            const newDeltas = data as Array<Op[]>;
            console.log(`Recieved New Ops: \n${JSON.stringify(newDeltas)}`);
            newDeltas.forEach((val) => {
                // @ts-ignore
                quill.updateContents(val);
            });
        }
    };

    const onTextChange = (delta: Delta, oldDelta: Delta, source: string) => {
        if (source === "user") {
            // queue.push(delta.ops);
            sendData(delta.ops);
        }
    };

    useEffect(() => {
        setQuill(
            new Quill("#editor", {
                modules: { toolbar: "#toolbar" },
                theme: "snow",
            })
        );
    }, [quillRef]);

    useEffect(() => {
        if (quill) {
            console.log("Connection ID: " + connectID);
            const evInstance = new EventSource(
                `${WARIO_URI}/connect/${connectID}`,
                { withCredentials: true }
            );
            evInstance.onmessage = handleIncomingData;
            window.addEventListener("beforeunload", () => {
                evInstance.close();
            });
            // @ts-ignore
            quill.on("text-change", onTextChange);
        }
    }, [quill]);

    return (
        <div>
            GIGA BOSS (OF SWAG)
            <div id="toolbar">
                <button className="ql-bold">Bold</button>
                <button className="ql-italic">Italic</button>
            </div>
            <div id="editor" ref={quillRef}></div>
            <script src="https://cdn.quilljs.com/1.0.0/quill.js"></script>
        </div>
    );
};

export default Document;
