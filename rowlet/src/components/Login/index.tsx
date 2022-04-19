import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WARIO_URI } from "../../config";

const defaultValues = {
    email: "",
    password: "",
};

const Login: React.FC = () => {
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
        const data = await fetch(`${WARIO_URI}/users/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formValues),
        });
        if (data.status === 200) {
            navigate("/home");
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
                    disabled={!formValues.email && !formValues.password}
                >
                    Submit
                </button>
            </form>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={() => navigate("/")}>Go Home</button>
        </>
    );
};

export default Login;
