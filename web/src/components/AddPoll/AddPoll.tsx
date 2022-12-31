import React, {useState} from 'react'
import PillButton, {PillButtonVariant} from "../PillButtons/PillButton";
import PillButtons from "../PillButtons/PillButtons";
import PillInput from "../PillInput/PillInput";
import {XCircleIcon} from "@heroicons/react/solid";
import './AddPoll.css'
import {AddPollChoice} from "../NewPost/NewPost";
import PillForm from "../PillForm/PillForm";


interface Props {
  choices: AddPollChoice[]
  onChangeChoices: (choices: AddPollChoice[]) => void
  onDone: () => void
}

export default (props: Props) => {
  const {choices, onChangeChoices} = props
  const [newChoiceText, updateNewChoiceText] = useState('')

  return (
    <PillForm>
      {choices.length > 0 ?
        <div className='add-poll-choices'>
          {choices.map((c, i) => {
            return (
              <div key={i} className='add-poll-choice'>
                <div className='add-poll-choice-text'>{c.text}</div>
                <XCircleIcon className='add-poll-delete-choice-icon' onClick={e => {
                  e.preventDefault()
                  onChangeChoices(choices.filter((_, ii) => i !== ii))
                }}/>
              </div>
            )
          })}
        </div> : <></>
      }
      <div className='add-poll-new-choice'>
        <PillInput
          placeholder={`Choice ${choices.length + 1}`}
          value={newChoiceText}
          onChange={updateNewChoiceText}
        />
      </div>
      <PillButtons>
        <PillButton
          text="Add a choice"
          variant={PillButtonVariant.Neutral}
          disabled={newChoiceText === ''}
          onClick={() => {
            onChangeChoices([...choices, {
              text: newChoiceText
            }])
            updateNewChoiceText('')
          }}
        />
        <PillButton
          text="Done"
          variant={PillButtonVariant.Positive}
          onClick={props.onDone}
        />
      </PillButtons>
    </PillForm>
  )
}
