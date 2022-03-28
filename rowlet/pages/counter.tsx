import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { SDoc } from "../util/sharedb";

interface CounterData {
    numClicks: number;
}

const CounterPage: NextPage = () => {
    const [doc, setDoc] = useState<SDoc<CounterData>>();
    const [numClicks, setNumClicks] = useState<number>(0);

    useEffect(() => {
        const getDoc = async () => {
            const newDoc = new SDoc<CounterData>("examples", "counter");
            await newDoc.subscribeDocument({ numClicks: 0 });
            newDoc.setDocOnOp(() => {
                setNumClicks(newDoc.doc.data.numClicks)
            })
            setDoc(newDoc);
            setNumClicks(newDoc.doc.data.numClicks);
        };
        getDoc();
    }, []);

    const handleClick = async () => {
        if (doc) {
            await doc.submitOp([{ p: ["numClicks"], na: 1 }]);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>ShareDB Counter Test</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {doc ? (
                <>
                    <div>You Clicked {numClicks} times.</div>
                    <button onClick={() => handleClick()}>+1</button>
                </>
            ) : (
                <div>Connection to Server Failed.</div>
            )}
        </div>
    );
};

export default CounterPage;
