import React, {useState} from "react";
import {useAppDispatch} from "../../store/hooks";
import {loadMe} from "../../store/meSlice";
import api from "../../api/Api";
import './UpdateBanner.css'
import PillForm from "../PillForm/PillForm";
import PillButtons from "../PillButtons/PillButtons";
import PillButton, {PillButtonVariant} from "../PillButtons/PillButton";
import User from "../../models/User";

const profilePicOptions = ["pill1.png", "pill2.png", "pill3.png", "pill4.png", "pill5.png", "pill6.png"]

interface Props {
  user: User | null
  dismiss: () => void
  beforeUpdate: () => void
  afterUpdate: () => void
}

export default (props: Props) => {
  const [selectedOption, updateSelectedOption] = useState<string>(props.user ? props.user.profile_pic : 'pill1.png')

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
        <img
          className="settings-profile-selection-option-img"
          src={`${process.env.PUBLIC_URL}/assets/${profilePicOptions[i].replace('.png', '.webp')}`}
          alt=""
        />
      </div>
    )
  }

  const dispatch = useAppDispatch()

  return (
    <PillForm>
      <div className="settings-profile-pic-preview" style={{
        backgroundColor: "#9dd0ff",
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/${selectedOption.replace('.png', '.webp')})`,
      }}/>
      <div className="settings-profile-pic-selections">
        {optionElems}
      </div>
      <PillButtons>
        <PillButton
          text='Cancel'
          variant={PillButtonVariant.Neutral}
          onClick={props.dismiss}
        />
        <PillButton
          text='Confirm'
          variant={PillButtonVariant.Positive}
          onClick={async () => {
            props.beforeUpdate()
            await api.updateProfilePic(selectedOption)
            await dispatch(loadMe())
            props.afterUpdate()
          }}
        />
      </PillButtons>
    </PillForm>
  )
}
