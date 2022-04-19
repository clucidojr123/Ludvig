import { useState, useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import Quill, { RangeStatic } from "quill";
import QuillCursors from "quill-cursors";
import Delta, { Op } from "quill-delta";
import { nanoid } from "nanoid";
import { useParams } from "react-router-dom";
import { WARIO_URI, S3_ACCESS_URI } from "../../config";

const Document = () => {
    const { docID } = useParams();
    const [connectID] = useState<string>(nanoid());
    const quillRef = useRef(null);
    const vRef = useRef({ version: 0 });
    const cRef = useRef<QuillCursors>();
    const quill = useRef<Quill>();

    const sendOps = async (ops: any[]) => {
        const payload = JSON.stringify({ op: ops, version: vRef.current.version });
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
        if (!data || !quill.current || !cRef.current) {
            console.log(
                "Recieved message with undefined data or quill or cursors is undefined!"
            );
        } else if (data.content) {
            console.log("Recieved Initial Data");
            vRef.current.version = data.version;
            quill.current.setContents(data.content);
        } else if (Array.isArray(data)) {
            const newOps = data as Op[];
            console.log(`Recieved New Ops: \n${JSON.stringify(newOps)}`);
            // @ts-ignore
            quill.current.updateContents(new Delta(newOps));
            vRef.current.version++;
        } else if (data.ack) {
            console.log("Recieved ACK");
            vRef.current.version++;
        } else if (data.presence) {
            console.log("Recieved PRESENCE");
            if (data.presence.cursor) {
                const newColor = Math.floor(Math.random() * 16777215).toString(
                    16
                );
                cRef.current.createCursor(
                    data.presence.id,
                    data.presence.cursor.name,
                    `#${newColor}`
                );
                cRef.current.moveCursor(data.presence.id, {
                    index: data.presence.cursor.index,
                    length: data.presence.cursor.length,
                });
            } else {
                cRef.current.removeCursor(data.presence.id);
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

    const selectLocalImage = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute('accept', 'image/*');
        input.click();

        // Listen upload local image and save to server
        input.onchange = (e) => {
            const fileList = input.files;
            if (fileList) {
                const file = fileList[0];
                saveToServer(file);
            } else {
                console.warn("Something bad happened when trying to upload a file");
            }
        };
    }

    const saveToServer = async (file: File) => {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(`${WARIO_URI}/media/upload`, {
            method: "POST",
            credentials: "include",
            body: fd,
        });

        const data = await res.json();
        if (!data || data.error) {
            console.log("Error uploading image to server");
        } else {
            insertToEditor(data.mediaid);
        }
    }

    function insertToEditor(mediaid: string) {
        // push image url to rich editor.
        if (quill.current) {
            const range = quill.current.getSelection();
            const delta = quill.current.insertEmbed(range?.index || 0, "image", `${S3_ACCESS_URI}/${mediaid}`);
            sendOps(delta.ops);
        }
    }

    useEffect(() => {
        Quill.register("modules/cursors", QuillCursors);
        quill.current = (
            new Quill("#editor", {
                modules: { toolbar: "#toolbar", cursors: true },
                theme: "snow",
            })
        );
    }, [quillRef]);

    useEffect(() => {
        if (quill.current) {
            cRef.current = quill.current.getModule("cursors");
            quill.current.getModule("toolbar").addHandler("image", () => {
                selectLocalImage();
            });
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
            quill.current.on("text-change", onTextChange);
            quill.current.on("selection-change", onSelectChange);
        }
    }, [quill]);

    return (
        <div>
            GIGA BOSS (OF SWAG)
            <div id="toolbar">
                <button className="ql-bold">Bold</button>
                <button className="ql-italic">Italic</button>
                <button className="ql-image">Image</button>
            </div>
            <div id="editor" ref={quillRef}></div>
            <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
        </div>
    );
};

export default Document;
