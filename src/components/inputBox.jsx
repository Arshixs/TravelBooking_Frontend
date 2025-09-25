import React from "react";
import "../styles/Signup.css";

function Inputbox({
  label,
  type,
  id,
  name,
  value,
  onChange,
  required = true,
  style,
  children, // Use children to pass error messages or other elements
}) {
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={style}
      />
      {/* Renders any nested content, like our error messages */}
      {children}
    </div>
  );
}

export default Inputbox;
