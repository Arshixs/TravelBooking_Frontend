import React from "react";
import "../styles/Profile.css";
import Inputbox from "./inputBox";

const ProfileField = ({
  label,
  name,
  value,
  onChange,
  isEditing,
  isEditable = true,
  type = "text",
}) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      {isEditing && isEditable ? (
        <Inputbox
          type={type}
          name={name}
          id={name} // Use name for id for label association
          value={value || ""} // Prevent uncontrolled input warning
          onChange={onChange}
        />
      ) : (
        <p>{value || "Not set"}</p>
      )}
    </div>
  );
};
export default ProfileField;
