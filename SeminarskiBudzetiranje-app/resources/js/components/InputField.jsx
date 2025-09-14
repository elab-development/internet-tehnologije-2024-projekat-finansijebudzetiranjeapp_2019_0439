import React from 'react';

const InputField = ({ label, type = "text", placeholder, value, onChange }) => {
    return (
        <div className="mb-4">
            {label && <label className="block mb-1 font-medium">{label}</label>}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-blue-500"
            />
        </div>
    );
};

export default InputField;