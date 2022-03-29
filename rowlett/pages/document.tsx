import type { NextPage } from "next";
import dynamic from 'next/dynamic'
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import 'react-quill/dist/quill.snow.css';
import { SDoc } from "../util/sharedb";
import Delta from "quill-delta";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const DocumentPage: NextPage = () => {
    const [doc, setDoc] = useState<SDoc<Delta>>();
    const [content, setContent] = useState<Delta>();
    const quillRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getDoc = async () => {
            const newDoc = new SDoc<Delta>("examples", "text", "ludvig");
            await newDoc.subscribeDocument(
                new Delta([{ insert: "Start Typing!" }])
            );
            setDoc(newDoc);
            setContent(newDoc.doc.data);
            newDoc.setDocOnOp((op, source) => {
                if (!source) {
                    setContent(newDoc.doc.data);
                }
            });
        };
        getDoc();
    }, []);

    const handleChange = async (content: string, delta: Delta, source: string) => {
        if (doc && delta && source === "user") {
            await doc.submitOp(delta);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>ShareDB Counter Test</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            { /* @ts-ignore */ }
            <ReactQuill value={content} onChange={handleChange} />
        </div>
    );
};

export default DocumentPage;
