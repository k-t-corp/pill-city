import React, {useRef, useState, useEffect} from "react";
import './DropdownMenu.css'

export default (props) => {
  const dropdownRef = useRef(null);
  const [isActive, updateIsActive] = useState(false);
  const triggerOnClick = () => updateIsActive(!isActive);

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
      <div onClick={triggerOnClick} className="dropdown-menu-trigger">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
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
