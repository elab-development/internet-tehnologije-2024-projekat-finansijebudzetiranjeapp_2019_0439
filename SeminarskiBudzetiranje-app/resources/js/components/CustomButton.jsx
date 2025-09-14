import React from 'react';

const CustomButton = ({ label, onClick, type = "button", styleType = "primary" }) => {
    const baseStyle = "px-4 py-2 rounded font-semibold transition-colors duration-200 ";
    const styles = {
        primary: baseStyle + "bg-blue-500 text-white hover:bg-blue-600",
        secondary: baseStyle + "bg-gray-500 text-white hover:bg-gray-600",
        danger: baseStyle + "bg-red-500 text-white hover:bg-red-600",
    };

    return (
        <button type={type} className={styles[styleType]} onClick={onClick}>
            {label}
        </button>
    );
};

export default CustomButton;