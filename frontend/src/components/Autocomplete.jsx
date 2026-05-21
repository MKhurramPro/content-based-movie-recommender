import React from 'react';

function Autocomplete({ suggestions, onSelect }) {
  return (
    <div className="autocomplete">
      <ul className="autocomplete-list">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="autocomplete-item"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Autocomplete;
