import React from "react";

export const Select = ({ children, onValueChange }) => {
  return <select onChange={(e) => onValueChange(e.target.value)}>{children}</select>;
};

export const SelectTrigger = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const SelectContent = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const SelectItem = ({ value, children, className }) => {
  return (
    <option value={value} className={className}>
      {children}
    </option>
  );
};

export const SelectValue = ({ placeholder }) => {
  return <option disabled hidden>{placeholder}</option>;
};
