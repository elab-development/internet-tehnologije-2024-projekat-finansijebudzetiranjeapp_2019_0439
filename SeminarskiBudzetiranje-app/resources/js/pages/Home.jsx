import React from 'react';
import CustomButton from '../components/CustomButton';
import Card from '../components/Card';
import InputField from '../components/InputField';

export default function Home() {
    const handleClick = () => {
        alert("Kliknuto dugme!");
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                Welcome to Finance Tracker
            </h1>
            <p style={{ marginBottom: '20px' }}>
                Manage your budget and track your expenses easily.
            </p>

            {/* Testiranje InputField komponente */}
            <InputField
                label="Unesite ime"
                placeholder="Ime"
                onChange={(e) => console.log(e.target.value)}
            />

            {/* Testiranje CustomButton komponente */}
            <div style={{ marginBottom: '20px' }}>
                <CustomButton label="Klikni me" onClick={handleClick} styleType="primary" />
                <span style={{ margin: '0 5px' }}></span>
                <CustomButton label="Sekundarno dugme" onClick={handleClick} styleType="secondary" />
                <span style={{ margin: '0 5px' }}></span>
                <CustomButton label="Opasna akcija" onClick={handleClick} styleType="danger" />
            </div>

            {/* Testiranje Card komponente */}
            <Card
                title="Primer kartice"
                description="Ovo je primer reusable komponente kartice."
                image="https://via.placeholder.com/300"
                onAction={() => alert("Klik na karticu")}
            />
        </div>
    );
}
