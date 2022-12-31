import React, {useRef, useState, useEffect} from "react";
import './PillDropdownMenu.css'

export interface DropdownMenuItem {
  text: string
  onClick: () => void
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
    <div className="pill-dropdown-menu-container" ref={dropdownRef}>
      <div
        className="pill-dropdown-children"
        onClick={() => updateIsActive(!isActive)}
      >
        {props.children}
      </div>
      <div
        className={`pill-dropdown-menu${isActive ? ' pill-dropdown-menu-active' : ''}`}
      >
        {props.items.map((item, i) => {
          return (
            <div
              key={i}
              className='pill-dropdown-menu-item'
              onClick={e => {
                e.preventDefault()
                item.onClick()
              }}
            >{item.text}</div>
          )
        })}
      </div>
    </div>
  );
};
