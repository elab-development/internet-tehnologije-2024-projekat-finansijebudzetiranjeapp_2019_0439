import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser, hasRole } from "./ProtectedRoute";
import CustomButton from "./CustomButton";

export default function Navbar() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const authenticated = isAuthenticated();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete window.axios?.defaults?.headers?.common["Authorization"];
        navigate("/login");
    };

    return (
        <nav
            style={{
                backgroundColor: "#2d3e50",
                padding: "10px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <div>
                {/* Logo/Brand */}
                <Link
                    to="/"
                    style={{
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: "20px",
                        fontWeight: "bold",
                        marginRight: "30px",
                    }}
                >
                    💰 Finance Tracker
                </Link>

                {/* Navigation Links */}
                <Link
                    to="/"
                    style={{
                        color: "#fff",
                        textDecoration: "none",
                        marginRight: "15px",
                    }}
                >
                    Home
                </Link>

                {/* Show Transactions link only for authenticated users */}
                {authenticated && (
                    <Link
                        to="/transactions"
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            marginRight: "15px",
                        }}
                    >
                        Transactions
                    </Link>
                )}

                {/* Admin-only links */}
                {hasRole("admin") && (
                    <>
                        <Link
                            to="/admin/users"
                            style={{
                                color: "#fff",
                                textDecoration: "none",
                                marginRight: "15px",
                            }}
                        >
                            Manage Users
                        </Link>
                        <Link
                            to="/admin/dashboard"
                            style={{
                                color: "#fff",
                                textDecoration: "none",
                                marginRight: "15px",
                            }}
                        >
                            Admin Dashboard
                        </Link>
                    </>
                )}
            </div>

            {/* User Info & Auth Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {authenticated ? (
                    <>
                        <span style={{ color: "#fff", fontSize: "14px" }}>
                            Welcome, <strong>{user?.name}</strong>
                            <span
                                style={{
                                    backgroundColor:
                                        user?.role === "admin"
                                            ? "#f44336"
                                            : "#4caf50",
                                    color: "white",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    marginLeft: "8px",
                                }}
                            >
                                {user?.role}
                            </span>
                        </span>
                        <CustomButton
                            label="Logout"
                            onClick={handleLogout}
                            styleType="secondary"
                        />
                    </>
                ) : (
                    <Link to="/login">
                        <CustomButton label="Login" styleType="primary" />
                    </Link>
                )}
            </div>
        </nav>
    );
}
