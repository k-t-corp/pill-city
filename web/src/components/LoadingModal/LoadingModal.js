import React from "react";
import "./LoadingModal.css"

export default (props) => {
  return (
    <div className='loading-modal'>
        <div className='loading-modal-content'>
          <div className="lds-circle">
            <div/>
          </div>
          <div>
            {props.title}
          </div>
      </div>
    </div>
  )
}
