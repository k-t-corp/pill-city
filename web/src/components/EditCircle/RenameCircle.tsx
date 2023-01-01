import React, {useState} from "react";
import './RenameCircle.css'
import PillInput from "../PillInput/PillInput";
import PillButtons from "../PillButtons/PillButtons";
import PillButton, {PillButtonVariant} from "../PillButtons/PillButton";
import Circle from "../../models/Circle";
import PillForm from "../PillForm/PillForm";

interface Props {
  circle: Circle
  onUpdate: (name: string) => void
  onClose: () => void
}

const RenameCircle = (props: Props) => {
  const {circle, onUpdate, onClose} = props
  const [name, updateName] = useState(circle.name)

  return (
    <PillForm>
      <PillInput
        placeholder="Circle name"
        value={name}
        onChange={updateName}
      />
      <PillButtons>
        <PillButton
          text="Cancel"
          variant={PillButtonVariant.Neutral}
          onClick={onClose}
        />
        <PillButton
          text="Confirm"
          variant={PillButtonVariant.Positive}
          onClick={() => {onUpdate(name)}}
          disabled={!name}
        />
      </PillButtons>
    </PillForm>
  )
}

export default RenameCircle
