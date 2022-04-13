import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const AllDocuments: React.FC = () => {
    const [docs, setDocs] = useState<Record<any, any>[]>([]);
    const [newDocName, setNewDocName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchDocs = async () => {
        const data = await fetch(`${WARIO_URI}/collection/list`, {
            method: "GET",
            credentials: "include",
        });
        if (data.status === 200) {
            const res = await data.json();
            setDocs(res);
        } else {
            navigate("/login");
        }
    };

    const handleCreateDocument = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = await fetch(`${WARIO_URI}/collection/create`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newDocName }),
        });
        if (data.status === 200) {
            const res = await data.json();
            setDocs([{ name: newDocName, id: res.docid }, ...docs]);
            setNewDocName("");
        } else {
            setError("Error When Submitting Form");
        }
    };

    const handleDeleteDoc = async (docid: string) => {
        const data = await fetch(`${WARIO_URI}/collection/delete`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ docid }),
        });
        if (data.status === 200) {
            setDocs((old) => {
                return old?.filter(val => val.id !== docid);
            });
        } 
    }

    const handleLogout = async () => {
        await fetch(`${WARIO_URI}/users/logout`, {
            method: "POST",
            credentials: "include",
        });
        navigate("/");
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    if (!docs) {
        return (
            <div>
                <h1>Loading Docs...</h1>
            </div>
        );
    }

    return (
        <div>
            <h1>Home Page</h1>
            <hr />
            <h3>Create New Document:</h3>
            <form onSubmit={handleCreateDocument}>
                <input
                    type="text"
                    name="name"
                    placeholder="Add Name Here"
                    value={newDocName}
                    onChange={(e) => {
                        setNewDocName(e.target.value);
                    }}
                ></input>
                <button type="submit" disabled={!newDocName}>
                    Create Document
                </button>
                {error && <div style={{ color: "red" }}>{error}</div>}
            </form>
            <hr />
            <h3>Recently Edited</h3>
            <ul>
                {docs.map((val, index) => (
                    <li key={`document-${index}`}>
                        <a href={`/doc/edit/${val.id}`}>{val.name}</a>
                        <button onClick={() => { handleDeleteDoc(val.id) }}>DELETE</button>
                    </li>
                ))}
            </ul>
            <hr />
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default AllDocuments;
