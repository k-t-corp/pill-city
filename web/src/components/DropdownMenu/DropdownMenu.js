import React, {useRef, useState, useEffect} from "react";
import './DropdownMenu.css'

export default (props) => {
  const dropdownRef = useRef(null);
  const [isActive, updateIsActive] = useState(false);

  useEffect(() => {
    const pageClickEvent = (e) => {
      if (dropdownRef.current !== null && !dropdownRef.current.contains(e.target)) {
        updateIsActive(!isActive);
      }
    };
    if (isActive) {
      window.addEventListener('click', pageClickEvent);
    }
    return () => {
      window.removeEventListener('click', pageClickEvent);
    }
  }, [isActive]);

  return (
    <div className="dropdown-menu-container" ref={dropdownRef}>
      <div style={{display: 'inline-block'}} onClick={() => updateIsActive(!isActive)}>
        {props.children}
      </div>
      <div
        className={`dropdown-menu${isActive ? ' dropdown-menu-active' : ''}`}
        onClick={() => {
          updateIsActive(false)
          props.onClick()
        }}
      >
        Delete
      </div>
    </div>
  );
};
