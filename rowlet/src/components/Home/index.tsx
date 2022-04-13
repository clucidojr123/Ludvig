import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const AllDocuments: React.FC = () => {
    const [docs, setDocs] = useState<Record<any, any>[]>();
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
            <ul>
            {docs.map((val, index) => (
                <li key={`document-${index}`}>
                    <a href={`/doc/edit/${val.id}`}>{val.name}</a>
                </li>
            ))}
            </ul>
        </div>
    );
};

export default AllDocuments;
