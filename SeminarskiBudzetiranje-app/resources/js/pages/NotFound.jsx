import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>404 - Stranica nije pronađena</h1>
            <p>Stranica koju tražite ne postoji.</p>
            <Link to="/" style={{ color: "#007bff" }}>Vrati se na početnu</Link>
        </div>
    );
}