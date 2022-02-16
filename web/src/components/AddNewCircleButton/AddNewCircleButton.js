import React from 'react'
import api from '../../api/Api'
import "./AddNewCircleButton.css"

export default () => {
  window.onclick = function(event) {
    let modal = document.getElementById("create-new-circle-modal");
    if (event.target === modal) {
      modal.style.visibility = "hidden";
    }
  }
  const addNewCircleButtonOnClick = () => {
    let modal = document.getElementById("create-new-circle-modal");
    modal.style.visibility = "visible";
  }

  const cancelModalButtonOnClick = () => {
    const modal = document.getElementById("create-new-circle-modal");
    modal.style.visibility = "hidden";
    const errorMessageBox = document.getElementById("new-circle-error-message-box")
    errorMessageBox.style.visibility = "hidden"
  }

  const createCircleButtonOnClick = async () => {
    const circleId = document.getElementById("new-circle-name-input").value
    try {
      await api.createCircle(circleId)
      window.location.reload()
    } catch (e) {
      console.error(e)
      let errorMessage = ""
      if (e.response.status === 409) {
        errorMessage = "You've used this name before. Please try another name >_<"
      } else {
        errorMessage = "Something went wrong. Please try again Later >_<"
      }
      const errorMessageBox = document.getElementById("new-circle-error-message-box")
      errorMessageBox.style.visibility = "visible"
      errorMessageBox.innerText = errorMessage
    }
  }

  return (
    <div className="add-new-circle-button-wrapper" >
      <div className="add-new-circle-button" onClick={addNewCircleButtonOnClick}>
        Create New Circle
      </div>
      <div id="create-new-circle-modal" className="modal">
        <div className="modal-content">
          <input type="text" id="new-circle-name-input" placeholder="New Circle Name"/>
          <div id="new-circle-error-message-box">
            Something went wrong. Please try again Later
          </div>
          <div className="modal-content-button-wrapper">
            <div className="modal-content-button cancel" onClick={cancelModalButtonOnClick}>
              Cancel
            </div>
            <div className="modal-content-button confirm" onClick={createCircleButtonOnClick}>
              Create
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
