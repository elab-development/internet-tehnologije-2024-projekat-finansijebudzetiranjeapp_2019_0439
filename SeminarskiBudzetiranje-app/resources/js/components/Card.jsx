import React from 'react';
import CustomButton from './CustomButton';

const Card = ({ title, description, image, onAction }) => {
    return (
        <div className="border rounded-lg shadow-md p-4 max-w-sm">
            {image && <img src={image} alt={title} className="rounded mb-3 w-full h-40 object-cover" />}
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            {onAction && <CustomButton label="Detaljnije" onClick={onAction} />}
        </div>
    );
};

export default Card;
