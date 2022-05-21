import React, {useState} from 'react'
import api from '../../api/Api'
import "./AddNewCircleButton.css"
import PillModal from "../PillModal/PillModal";
import {useToast} from "../Toast/ToastProvider";

export default () => {
  const [modalOpened, updateModalOpened] = useState(false)
  const [circleName, updateCircleName] = useState('')
  const {addToast} = useToast()

  return (
    <>
      <div className="add-new-circle-button-wrapper">
        <div
          className="add-new-circle-button"
          onClick={() => {updateModalOpened(true)}}
        >
          Create New Circle
        </div>
      </div>
      <PillModal
        isOpen={modalOpened}
        onClose={() => {updateModalOpened(false)}}
      >
        <input
          className='add-new-circle-name-input'
          type="text"
          placeholder="New Circle Name"
          value={circleName}
          onChange={e=> {
            e.preventDefault()
            updateCircleName(e.target.value)
          }}
        />
        <div className="modal-content-button-wrapper">
          <div
            className="modal-content-button cancel"
            onClick={() => {
              updateModalOpened(false)
            }}
          >
            Cancel
          </div>
          <div
            className="modal-content-button confirm"
            onClick={async () => {
              if (!circleName) {
                return
              }
              try {
                await api.createCircle(circleName)
                window.location.reload()
              } catch (e: any) {
                console.error(e)
                let errorMessage = ""
                if (e.statusCode === 409) {
                  errorMessage = "You've used this name before. Please try another name >_<"
                } else {
                  errorMessage = "Something went wrong. Please try again Later >_<"
                }
                addToast(errorMessage)
              }
            }}
          >
            Create
          </div>
        </div>
      </PillModal>
    </>
  )
}
