import React, { useState, useEffect } from "react";
import axios from "axios";
import CustomButton from "../components/CustomButton";

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Napomena: Trebao bi vam API endpoint za listing users
        // Ovde simuliramo loadovanje korisnika kroz accounts
        loadUsersData();
    }, []);

    const loadUsersData = async () => {
        try {
            setLoading(true);

            // Pošto nemate direktan /api/users endpoint, uzimamo preko accounts
            const accountsRes = await axios.get("/api/accounts?per_page=1000");
            const accounts = accountsRes.data.data || accountsRes.data;

            // Grupisanje po korisnicima
            const usersMap = {};
            accounts.forEach((account) => {
                if (!usersMap[account.user_id]) {
                    usersMap[account.user_id] = {
                        id: account.user_id,
                        accounts: [],
                        totalBalance: 0,
                    };
                }
                usersMap[account.user_id].accounts.push(account);
                usersMap[account.user_id].totalBalance += parseFloat(
                    account.balance || 0
                );
            });

            setUsers(Object.values(usersMap));
        } catch (err) {
            setError("Failed to load users data");
            console.error("Users loading error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this user? This will delete all their accounts and transactions!"
            )
        ) {
            return;
        }

        try {
            // Napomena: Trebao bi vam API endpoint za brisanje korisnika
            // await axios.delete(`/api/admin/users/${userId}`);
            alert(
                "User deletion would be implemented with proper API endpoint"
            );
            // loadUsersData(); // Refresh after delete
        } catch (err) {
            setError("Failed to delete user");
            console.error("Delete user error:", err);
        }
    };

    const handleChangeUserRole = async (userId, newRole) => {
        try {
            // Napomena: Trebao bi vam API endpoint za menjanje uloge
            // await axios.patch(`/api/admin/users/${userId}`, { role: newRole });
            alert(
                `Would change user ${userId} role to ${newRole} with proper API endpoint`
            );
            // loadUsersData(); // Refresh after update
        } catch (err) {
            setError("Failed to change user role");
            console.error("Change role error:", err);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>Loading users...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                }}
            >
                <h1 style={{ color: "#2d3e50" }}>Manage Users</h1>
                <div
                    style={{
                        backgroundColor: "#fff3cd",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ffeaa7",
                        color: "#856404",
                    }}
                >
                    👑 Admin Only Area
                </div>
            </div>

            {error && (
                <div
                    style={{
                        color: "red",
                        marginBottom: "20px",
                        padding: "10px",
                        border: "1px solid red",
                        borderRadius: "4px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Users Summary */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    marginBottom: "30px",
                }}
            >
                <h3>Users Overview</h3>
                <p>
                    Total Users: <strong>{users.length}</strong>
                </p>
                <p>
                    Total System Balance:{" "}
                    <strong>
                        $
                        {users
                            .reduce((sum, user) => sum + user.totalBalance, 0)
                            .toFixed(2)}
                    </strong>
                </p>
            </div>

            {/* Users Table */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <h3>All Users</h3>
                    <CustomButton
                        label="Refresh Data"
                        onClick={loadUsersData}
                        styleType="secondary"
                    />
                </div>

                {users.length === 0 ? (
                    <p
                        style={{
                            color: "#666",
                            textAlign: "center",
                            padding: "40px",
                        }}
                    >
                        No users found.
                    </p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa" }}>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        User ID
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        Accounts
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        Total Balance
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        Account Names
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td
                                            style={{
                                                padding: "12px",
                                                border: "1px solid #ddd",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            #{user.id}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                border: "1px solid #ddd",
                                            }}
                                        >
                                            {user.accounts.length} account
                                            {user.accounts.length !== 1
                                                ? "s"
                                                : ""}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                border: "1px solid #ddd",
                                                fontWeight: "bold",
                                                color:
                                                    user.totalBalance >= 0
                                                        ? "#2ecc71"
                                                        : "#e74c3c",
                                            }}
                                        >
                                            ${user.totalBalance.toFixed(2)}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                border: "1px solid #ddd",
                                            }}
                                        >
                                            {user.accounts
                                                .map((acc) => acc.name)
                                                .join(", ")}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                border: "1px solid #ddd",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "5px",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleChangeUserRole(
                                                                user.id,
                                                                e.target.value
                                                            );
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                    style={{
                                                        padding: "4px 8px",
                                                        fontSize: "12px",
                                                        borderRadius: "4px",
                                                        border: "1px solid #ddd",
                                                    }}
                                                >
                                                    <option value="">
                                                        Change Role
                                                    </option>
                                                    <option value="user">
                                                        Make User
                                                    </option>
                                                    <option value="admin">
                                                        Make Admin
                                                    </option>
                                                    <option value="guest">
                                                        Make Guest
                                                    </option>
                                                </select>

                                                <button
                                                    onClick={() =>
                                                        alert(
                                                            `View details for user ${user.id} - implement with proper user details endpoint`
                                                        )
                                                    }
                                                    style={{
                                                        padding: "4px 8px",
                                                        fontSize: "12px",
                                                        backgroundColor:
                                                            "#3498db",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id
                                                        )
                                                    }
                                                    style={{
                                                        padding: "4px 8px",
                                                        fontSize: "12px",
                                                        backgroundColor:
                                                            "#e74c3c",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Implementation Notes */}
            <div
                style={{
                    backgroundColor: "#e3f2fd",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "20px",
                    border: "1px solid #bbdefb",
                }}
            >
                <h4 style={{ color: "#1976d2", marginTop: 0 }}>
                    Implementation Notes:
                </h4>
                <ul style={{ color: "#424242", margin: 0 }}>
                    <li>
                        This page shows user data derived from accounts (since
                        there's no direct /api/users endpoint)
                    </li>
                    <li>
                        To fully implement user management, you'd need
                        additional API endpoints:
                    </li>
                    <ul>
                        <li>
                            <code>GET /api/admin/users</code> - List all users
                            with details
                        </li>
                        <li>
                            <code>PATCH /api/admin/users/{id}</code> - Update
                            user role/details
                        </li>
                        <li>
                            <code>DELETE /api/admin/users/{id}</code> - Delete
                            user
                        </li>
                    </ul>
                    <li>
                        Role changes and deletions currently show alerts -
                        replace with actual API calls
                    </li>
                </ul>
            </div>
        </div>
    );
}
