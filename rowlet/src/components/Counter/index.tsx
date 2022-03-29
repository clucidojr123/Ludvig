import React, { useState, useEffect } from 'react'
import { SDoc } from "../../util/sharedb";

interface CounterData {
    numClicks: number;
}

const Counter = () => {
    const [doc, setDoc] = useState<SDoc<CounterData>>();
    const [numClicks, setNumClicks] = useState<number>(0);

    useEffect(() => {
        const getDoc = async () => {
            // @ts-ignore
            const newDoc = new SDoc<CounterData>("examples", "counter", "json0");
            await newDoc.subscribeDocument({ numClicks: 0 });
            newDoc.setDocOnOp(() => {
                setNumClicks(newDoc.doc.data.numClicks);
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
        <div>
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

export default Counter;