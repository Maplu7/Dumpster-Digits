import React from "react";
import "./Shop.css";

import raccoon from "./images/raccoon.png";

const items = [
    {id: 1, name: "Pirate Hat", price: 20, image: raccoon},
    {id: 2, name: "Chef Hat", price: 50, image: raccoon},
    {id: 3, name: "Cowboy Hat", price: 30, image: raccoon},
    {id: 4, name: "Can", price: 40, image: raccoon},
    {id: 5, name: "Crown", price: 25, image: raccoon}
];

const Shop = ({ coins = 100, onBack }) => {
    return (
        <div className="shop-container">
            
            <h2>Shop</h2>
            <button onClick={onBack}>Back</button>
            <div className="items">
                {items.map(item => (
                    <div key={item.id} className="item">
                        <img src={item.image} alt={item.name} />
                        <h3>{item.name}</h3>
                        <p>Price: {item.price} coins</p>
                        <button disabled={coins < item.price}>Buy</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
