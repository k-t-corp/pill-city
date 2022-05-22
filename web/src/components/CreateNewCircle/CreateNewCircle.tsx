import React, {useState} from "react"
import api from "../../api/Api";
import {useToast} from "../Toast/ToastProvider";
import ApiError from "../../api/ApiError";
import './CreateNewCircle.css'

interface Props {
  onCancel: () => void
}

export default (props: Props) => {
  const [name, updateName] = useState('')
  const {addToast} = useToast()

  return (
    <>
      <input
        className='add-new-circle-name-input'
        type="text"
        placeholder="New Circle Name"
        value={name}
        onChange={e=> {
          e.preventDefault()
          updateName(e.target.value)
        }}
      />
      <div className="modal-content-button-wrapper">
        <div
          className="modal-content-button cancel"
          onClick={() => {
            props.onCancel()
          }}
        >
          Cancel
        </div>
        <div
          className="modal-content-button confirm"
          onClick={async () => {
            if (!name) {
              return
            }
            try {
              await api.createCircle(name)
              window.location.reload()
            } catch (e: any) {
              if (e instanceof ApiError) {
                addToast(e.message)
              } else {
                addToast('Unknown error')}
            }
          }}
        >
          Create
        </div>
      </div>
    </>
  )
}
