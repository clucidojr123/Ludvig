import React, { useState, useEffect } from "react";

const Counter = () => {
    const [numClicks, setNumClicks] = useState<number>();

    useEffect(() => {
        const evInstance = new EventSource("http://localhost:3001/counter");
        evInstance.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setNumClicks(data.numClicks);
        };
    }, []);

    const handleClick = async () => {
        await fetch("http://localhost:3001/counter", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{ p: ["numClicks"], na: 1 }]),
        });
    };

    return (
        <div>
            {numClicks !== undefined ? (
                <>
                    <div>You Clicked {numClicks} times.</div>
                    <button onClick={() => handleClick()}>+1</button>
                </>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default Counter;
