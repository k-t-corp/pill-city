import Modal from "react-modal";
import React from "react";
import {useMediaQuery} from "react-responsive";
import {XIcon} from "@heroicons/react/solid";
import './MyModal.css'

interface Props {
  children: any
  isOpen: boolean
  onClose: () => void
}

export default (props: Props) => {
  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})
  let styles = {}
  if (isTabletOrMobile) {
    styles = {
      backgroundColor: '#ffffff',
      borderRadius: '0',
      resize: 'none',
      top: '0',
      left: '0',
      right: '0',
    }
  } else {
    styles = {
      backgroundColor: '#ffffff',
      borderRadius: '5px',
      boxShadow: '2px 2px 1px 1px #e0e0e0',
      resize: 'none',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '800px'
    }
  }

  return (
    <Modal
      isOpen={props.isOpen}
      style={{
        content: styles
      }}
      onRequestClose={props.onClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      {isTabletOrMobile &&
        <XIcon
          className='my-modal-close-button'
          onClick={props.onClose}
        />
      }
      {props.children}
    </Modal>
  )
}
