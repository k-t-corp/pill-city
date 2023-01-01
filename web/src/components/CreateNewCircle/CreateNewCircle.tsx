import React, {useState} from "react"
import './CreateNewCircle.css'
import PillForm from "../PillForm/PillForm";
import PillInput from "../PillInput/PillInput";
import PillButtons from "../PillButtons/PillButtons";
import PillButton, {PillButtonVariant} from "../PillButtons/PillButton";

interface Props {
  onCreate: (name: string) => void
  onCancel: () => void
}

const CreateNewCircle = (props: Props) => {
  const [name, updateName] = useState('')

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
          onClick={props.onCancel}
        />
        <PillButton
          text="Create"
          variant={PillButtonVariant.Positive}
          onClick={() => {
            props.onCreate(name)
          }}
        />
      </PillButtons>
    </PillForm>
  )
}

export default CreateNewCircle
