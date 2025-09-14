import React from 'react';

const CustomButton = ({ label, onClick, type = "button", styleType = "primary" }) => {
    // Mapiranje prop-a styleType na CSS klase iz app.css
    const styles = {
        primary: "btn btn-primary",
        secondary: "btn btn-secondary",
        danger: "btn btn-danger",
    };

    return (
        <button 
            type={type} 
            className={styles[styleType] || styles.primary} 
            onClick={onClick}
        >
            {label}
        </button>
    );
};

export default CustomButton;