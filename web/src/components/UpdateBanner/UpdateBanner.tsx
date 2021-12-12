import React, {useState} from "react";
import {useAppDispatch} from "../../store/hooks";
import {loadMe} from "../../store/meSlice";
import './UpdateBanner.css'

const profilePicOptions = ["pill1.png", "pill2.png", "pill3.png", "pill4.png", "pill5.png", "pill6.png"]

interface Props {
  api: any
  dismiss: () => void
  beforeUpdate: () => void
  afterUpdate: () => void
}

export default (props: Props) => {
  const [selectedOption, updateSelectedOption] = useState<string | null>(null)

  let optionElems = []
  for (let i = 0; i < profilePicOptions.length; i++) {
    const selected = selectedOption === profilePicOptions[i] ? "settings-profile-selection-option-selected" : null
    optionElems.push(
      <div
        key={i}
        className={`settings-profile-selection-option ${selected}`}
        onClick={() => {
          updateSelectedOption(profilePicOptions[i])
        }}
      >
        <img className="settings-profile-selection-option-img"
             src={`${process.env.PUBLIC_URL}/${profilePicOptions[i]}`} alt=""/>
      </div>
    )
  }

  const dispatch = useAppDispatch()

  return (
    <div className="settings-profile-pic-content">
      <div id="settings-profile-pic-preview" style={{
        backgroundColor: "#9dd0ff",
        backgroundImage: `url(${process.env.PUBLIC_URL}/${selectedOption})`,
      }}/>
      <div className="settings-profile-pic-selections">
        {optionElems}
      </div>
      <div className="settings-buttons">
        <div className="settings-cancel-button" onClick={props.dismiss}>
          Cancel
        </div>
        <div
          onClick={async () => {
            props.beforeUpdate()
            await props.api.updateProfilePic(selectedOption)
            await dispatch(loadMe())
            props.afterUpdate()
          }}>Update</div>
      </div>
    </div>
  )
}
