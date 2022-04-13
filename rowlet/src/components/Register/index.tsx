import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WARIO_URI = process.env.REACT_APP_WARIO_URI || "";

const defaultValues = {
    email: "",
    name: "",
    password: "",
};

const Register: React.FC = () => {
    const [formValues, setFormValues] = useState(defaultValues);
    const [error, setError] = useState("");
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
        const data = await fetch(`${WARIO_URI}/users/signup`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formValues),
        });
        if (data.status === 200) {
            navigate("/login");
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
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    required
                    onChange={handleInputChange}
                />
                <br />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    name="password"
                    value={formValues.password}
                    required
                    onChange={handleInputChange}
                />
                <button
                    type="submit"
                    disabled={!formValues.name && !formValues.password}
                >
                    Submit
                </button>
            </form>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={() => navigate("/")}>Go Home</button>
        </>
    );
};

export default Register;
