import { useState, useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import Delta, { Op } from "quill-delta";
import { nanoid } from "nanoid";
import { useParams } from "react-router-dom";
const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const Document = () => {
    const { docID } = useParams();
    const [connectID] = useState<string>(nanoid());
    const [quill, setQuill] = useState<Quill>();
    const quillRef = useRef(null);

    let version = 0;

    const sendData = async (ops: any[]) => {
        const payload = JSON.stringify({ op: ops, version });
        console.log(`Sending Data: ${payload}`);
        await fetch(`${WARIO_URI}/doc/op/${docID}/${connectID}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: payload,
        });
    };

    const handleIncomingData = (e: MessageEvent<any>) => {
        const data = JSON.parse(e.data);
        if (!data || !quill) {
            console.log(
                "Recieved message with undefined data or quill is undefined!"
            );
        } else if (data.content) {
            console.log("Recieved Initial Data");
            version = data.version;
            quill.setContents(data.content);
        } else if (Array.isArray(data)) {
            const newOps = data as Op[];
            console.log(`Recieved New Ops: \n${JSON.stringify(newOps)}`);
            // @ts-ignore
            quill.updateContents(new Delta(newOps));
            version++;
        } else if (data.ack) {
            console.log("Recieved ACK");
            version++;
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
                `${WARIO_URI}/doc/connect/${docID}/${connectID}`,
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
