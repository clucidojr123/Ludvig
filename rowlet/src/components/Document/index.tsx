import React, { useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import Delta, { Op } from "quill-delta";
import { nanoid } from 'nanoid'

const Document = () => {
    const [content, setContent] = useState<Delta>(new Delta());
    const [connectID, setConnectID] = useState<string>(nanoid());

    useEffect(() => {
        console.log("Initial Connection ID: " + connectID);
        const evInstance = new EventSource(
            `http://localhost:3001/connect/${connectID}`
        );
        window.addEventListener("beforeunload", () => {
            evInstance.close();
        });
        evInstance.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Recieved New Data");
            if (data && !Array.isArray(data) && data.content) {
                setContent(new Delta(data.content));
            } else {
                const newDeltas = data as Array<Op[]>;
                newDeltas.forEach((val) => {
                    val.forEach((val) => {
                        content.push(val);
                    })
                });
                setContent(content);
            }
        };
    }, []);

    const handleChange = async (
        value: string,
        delta: Delta,
        source: string
    ) => {
        if (delta && source === "user") {
            await fetch(`http://localhost:3001/op/${connectID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: `[${JSON.stringify(delta.ops)}]`,
            });
        }
    };

    return (
        <div>
            {content ? (
                /*
                // @ts-ignore */
                <ReactQuill placeholder="Start Typing..." value={content} onChange={handleChange}
                />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Document;
