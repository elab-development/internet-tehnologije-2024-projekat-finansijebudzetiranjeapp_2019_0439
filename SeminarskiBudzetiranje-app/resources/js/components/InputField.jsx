import React from 'react';

const InputField = ({ label, type = "text", placeholder, value, onChange }) => {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="input-field"
            />
        </div>
    );
};

export default InputField;
