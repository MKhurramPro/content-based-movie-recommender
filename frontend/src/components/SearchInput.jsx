import React from 'react';

function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      className="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus
    />
  );
}

export default SearchInput;
