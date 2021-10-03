import React, {useRef, useState, useEffect} from "react";
import './DropdownMenu.css'

export interface DropdownMenuItem {
  text: string
  callback: () => void
}

interface Props {
  items: DropdownMenuItem[]
  children: JSX.Element,
}

export default (props: Props) => {
  const dropdownRef = useRef(null);
  const [isActive, updateIsActive] = useState(false);

  useEffect(() => {
    const pageClickEvent = (e: any) => {
      if (dropdownRef.current !== null && !(dropdownRef.current as any).contains(e.target)) {
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
      >
        {props.items.map((item, i) => {
          return (
            <div
              key={i}
              className='dropdown-menu-item'
              onClick={item.callback}
            >{item.text}</div>
          )
        })}
      </div>
    </div>
  );
};
