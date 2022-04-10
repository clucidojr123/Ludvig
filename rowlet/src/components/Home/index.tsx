import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

function Home() {
    const [user, setUser] = useState<Record<any, any> | string>(
        "Not logged in!"
    );

    const fetchUser = async () => {
        const data = await fetch(`${WARIO_URI}/get-session`, {
            method: "GET",
            credentials: "include",
        });
        if (data.status === 200) {
            const res = await data.json();
            setUser(res);
        } else {
            setUser("Not logged in!");
        }
    };

    const handleLogout = async () => {
        await fetch(`${WARIO_URI}/logout`, {
            method: "POST",
            credentials: "include",
        });
        await fetchUser();
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div style={{ width: "100%", wordWrap: "break-word", }}>
            <header className="App-header">
                <h1>GIGA BOSS OF SWAG GOOGLE DOCS CLONE</h1>
                <br />
                <h4>{JSON.stringify(user)}</h4>
                <br />
                <Link to="/login">Login</Link>
                <br />
                <Link to="/register">Register</Link>
                <br />
                <Link to="/verify">Verify</Link>
                <br />
                <button onClick={handleLogout}>Logout</button>
                {/* <Link to="/docs">All Docs</Link> */}
            </header>
        </div>
    );
}

export default Home;
