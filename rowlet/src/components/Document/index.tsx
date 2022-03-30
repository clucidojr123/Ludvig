import React, { useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import Delta from "quill-delta";

const Document = () => {
    const [content, setContent] = useState<Delta>();

    useEffect(() => {
        const evInstance = new EventSource(
            "http://localhost:3001/connect/swag"
        );
        window.addEventListener("beforeunload", () => {
            evInstance.close();
        });
        evInstance.onmessage = (e) => {
            console.log("Recieved New Message");
            const data = JSON.parse(e.data);
            console.log(data);
            if (data.content) {
                setContent(new Delta(data.content));
            } else {
                setContent(new Delta(data));
            }
        };
    }, []);

    const handleChange = async (
        value: string,
        delta: Delta,
        source: string
    ) => {
        if (delta && source === "user") {
            await fetch("http://localhost:3001/op/swag", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(delta.ops),
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
