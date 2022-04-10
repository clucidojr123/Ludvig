import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const defaultValues = {
    email: "",
    key: "",
};

const Verify: React.FC = () => {
    const [formValues, setFormValues] = useState(defaultValues);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = await fetch(`${WARIO_URI}/verify`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formValues),
        });
        if (data.status === 200) {
            setMessage("Succesfully Verified!");
        } else {
            setError("Error When Submitting Form");
        }
    };

    return (
        <>
            <form id="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    required
                    onChange={handleInputChange}
                />
                <br />
                <label htmlFor="password">Secret Key:</label>
                <input
                    type="password"
                    name="key"
                    value={formValues.key}
                    required
                    onChange={handleInputChange}
                />
                <button
                    type="submit"
                    disabled={!formValues.email && !formValues.key && !!message}
                >
                    Submit
                </button>
            </form>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {message && <div style={{ color: "green" }}>{message}</div>}
            <button onClick={() => navigate("/")}>Go Home</button>
        </>
    );
};

export default Verify;
