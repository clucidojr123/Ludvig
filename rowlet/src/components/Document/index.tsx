import React, { useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { DeltaOperation as DeltaOp } from "quill";
import Delta from "quill-delta";
import { SDoc } from "../../util/sharedb";

const Document = () => {
    const [doc, setDoc] = useState<SDoc<DeltaOp[]>>();
    const [content, setContent] = useState<Delta>();

    useEffect(() => {
        const getDoc = async () => {
            const newDoc = new SDoc<DeltaOp[]>("examples", "text", "rich-text");
            await newDoc.subscribeDocument([{ insert: "" }]);
            setDoc(newDoc);
            setContent(new Delta(newDoc.doc.data));
            newDoc.setDocOnOp((op, source) => {
                if (op && !source) {
                    setContent(new Delta(newDoc.doc.data));
                }
            });
        };
        getDoc();
    }, []);

    const handleChange = async (
        value: string,
        delta: Delta,
        source: string
    ) => {
        if (doc && delta && source === "user") {
            await doc.submitOp(delta);
        }
    };

    return (
        <div>
            {/*
            // @ts-ignore */}
            <ReactQuill placeholder="Start Typing..." value={content} onChange={handleChange} />
        </div>
    );
};

export default Document;
