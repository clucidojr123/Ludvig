import React, { useState, useEffect } from "react";

function Home() {
    const [content, setContent] = useState<string>("Nothing");
    useEffect(() => {
        const evInstance = new EventSource(
            "http://localhost:3001/connect/swag"
        );
        evInstance.onmessage = (e) => {
            setContent(e.data);
        };
    }, []);

    return (
        <>
            <header className="App-header">
                <h1>{content}</h1>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </>
    );
}

export default Home;
