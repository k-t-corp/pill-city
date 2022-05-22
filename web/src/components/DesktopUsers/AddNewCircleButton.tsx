import React, {useState} from 'react'
import "./AddNewCircleButton.css"
import PillModal from "../PillModal/PillModal";
import CreateNewCircle from "../CreateNewCircle/CreateNewCircle";

export default () => {
  const [modalOpened, updateModalOpened] = useState(false)

  return (
    <>
      <div className="add-new-circle-button-wrapper">
        <div
          className="add-new-circle-button"
          onClick={() => {updateModalOpened(true)}}
        >
          Create new circle
        </div>
      </div>
      <PillModal
        isOpen={modalOpened}
        onClose={() => {updateModalOpened(false)}}
        title="Create new circle"
      >
        <CreateNewCircle
          onCancel={() => {updateModalOpened(false)}}
        />
      </PillModal>
    </>
  )
}
