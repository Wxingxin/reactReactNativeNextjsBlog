"use client";
import React, { useState } from "react";

export default function Contact() {
  const items = [
    { id: 1, name: "item 1" },
    { id: 2, name: "item 2" },
    { id: 3, name: "item 3" },
  ];

  const [itemList, setItemList] = useState(items);

  const handleClick = () => {
    setItemList((pre) => {
      setTimeout(() => {
        return [...pre, { id: pre.length + 1, name: `item ${pre.length + 1}` }];
      }, 1000);
    });
  };



  return (
    <div>
      <h1>Contact Page</h1>
      <button onClick={handleClick}>Add Item</button>
      <ul>
        {itemList.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <div>
        <h2>Form</h2>
        <form>
          <label>Name:</label>
          <input type="text" name="name" />
          <label>Email:</label>
          <input type="email" name="email" />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
