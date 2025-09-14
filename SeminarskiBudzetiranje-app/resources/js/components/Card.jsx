import React from 'react';
import CustomButton from './CustomButton';

const Card = ({ title, description, image, onAction }) => {
    return (
        <div className="card">
            {image && <img src={image} alt={title} className="card-image" />}
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
            {onAction && (
                <CustomButton 
                    label="Detaljnije" 
                    onClick={onAction} 
                    styleType="primary" 
                />
            )}
        </div>
    );
};

export default Card;