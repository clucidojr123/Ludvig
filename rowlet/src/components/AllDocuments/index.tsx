import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const AllDocuments: React.FC = () => {
    const [docs, setDocs] = useState<Record<any, any>[]>();
    const navigate = useNavigate();

    const fetchDocs = async () => {
        const data = await fetch(`${WARIO_URI}/alldocs`, {
            method: "GET",
            credentials: "include",
        });
        if (data.status === 200) {
            const res = await data.json();
            setDocs(res.docs);
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
            <h1>All Docs</h1>
            {docs.map((val, index) => (
                <div key={`document-${index}`}>{val.id}</div>
            ))}
        </div>
    );
};

export default AllDocuments;
