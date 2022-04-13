import { useState, useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import Quill, { RangeStatic } from "quill";
import QuillCursors from "quill-cursors";
import Delta, { Op } from "quill-delta";
import { nanoid } from "nanoid";
import { useParams } from "react-router-dom";
const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const Document = () => {
    const { docID } = useParams();
    const [connectID] = useState<string>(nanoid());
    const [quill, setQuill] = useState<Quill>();
    const [cursors, setCursors] = useState<QuillCursors>();
    const quillRef = useRef(null);

    let version = 0;

    const sendOps = async (ops: any[]) => {
        const payload = JSON.stringify({ op: ops, version });
        console.log(`Sending Ops: ${payload}`);
        await fetch(`${WARIO_URI}/doc/op/${docID}/${connectID}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: payload,
        });
    };

    const sendPresence = async (presence: RangeStatic) => {
        const payload = JSON.stringify({
            index: presence.index,
            length: presence.length,
        });
        console.log(`Sending Presence: ${payload}`);
        await fetch(`${WARIO_URI}/doc/presence/${docID}/${connectID}`, {
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
        if (!data || !quill || !cursors) {
            console.log(
                "Recieved message with undefined data or quill or cursors is undefined!"
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
        } else if (data.presence) {
            console.log("Recieved PRESENCE");
            if (data.presence.cursor) {
                const newColor = Math.floor(Math.random() * 16777215).toString(
                    16
                );
                cursors.createCursor(
                    data.presence.id,
                    data.presence.cursor.name,
                    `#${newColor}`
                );
                cursors.moveCursor(data.presence.id, {
                    index: data.presence.cursor.index,
                    length: data.presence.cursor.length,
                });
            } else {
                cursors.removeCursor(data.presence.id);
            }
        }
    };

    const onTextChange = (delta: Delta, oldDelta: Delta, source: string) => {
        if (source === "user") {
            sendOps(delta.ops);
        }
    };

    const onSelectChange = (
        range: RangeStatic,
        oldRange: RangeStatic,
        source: string
    ) => {
        if (range && source === "user") {
            sendPresence(range);
        }
    };

    useEffect(() => {
        Quill.register("modules/cursors", QuillCursors);
        setQuill(
            new Quill("#editor", {
                modules: { toolbar: "#toolbar", cursors: true },
                theme: "snow",
            })
        );
    }, [quillRef]);

    useEffect(() => {
        if (quill) {
            setCursors(quill.getModule("cursors"));
        }
    }, [quill]);

    useEffect(() => {
        if (quill && cursors) {
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
            quill.on("selection-change", onSelectChange);
        }
    }, [cursors]);

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
