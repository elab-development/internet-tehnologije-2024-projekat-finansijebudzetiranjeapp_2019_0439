import React, { useState, useEffect } from "react";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("income");
    const [balance, setBalance] = useState(0);

    // Učitavanje iz localStorage-a
    useEffect(() => {
        const savedTransactions =
            JSON.parse(localStorage.getItem("transactions")) || [];
        setTransactions(savedTransactions);
    }, []);

    // Računanje balansa svaki put kad se promeni lista transakcija
    useEffect(() => {
        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((acc, curr) => acc + curr.amount, 0);

        const expense = transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, curr) => acc + curr.amount, 0);

        setBalance(income - expense);

        // Čuvanje u localStorage
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }, [transactions]);

    const addTransaction = () => {
        if (!description || !amount) {
            alert("Please enter description and amount.");
            return;
        }

        const newTransaction = {
            id: Date.now(),
            description,
            amount: parseFloat(amount),
            type,
        };

        setTransactions([newTransaction, ...transactions]);
        setDescription("");
        setAmount("");
        setType("income");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Transactions</h1>

            {/* Prikaz balansa */}
            <h2>Current Balance: ${balance.toFixed(2)}</h2>

            {/* Forma za unos transakcije */}
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                <InputField
                    label="Description"
                    placeholder="e.g., Salary or Rent"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <InputField
                    label="Amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <div style={{ marginBottom: "10px" }}>
                    <label>
                        <input
                            type="radio"
                            value="income"
                            checked={type === "income"}
                            onChange={(e) => setType(e.target.value)}
                        />
                        Income
                    </label>
                    <label style={{ marginLeft: "10px" }}>
                        <input
                            type="radio"
                            value="expense"
                            checked={type === "expense"}
                            onChange={(e) => setType(e.target.value)}
                        />
                        Expense
                    </label>
                </div>

                <CustomButton
                    label="Add Transaction"
                    onClick={addTransaction}
                    styleType="primary"
                />
            </div>

            {/* Lista transakcija */}
            <ul>
                {transactions.map((t) => (
                    <li
                        key={t.id}
                        style={{
                            borderBottom: "1px solid #ccc",
                            padding: "5px 0",
                            color: t.type === "income" ? "green" : "red",
                        }}
                    >
                        {t.description} - ${t.amount.toFixed(2)} ({t.type})
                    </li>
                ))}
            </ul>
        </div>
    );
}
