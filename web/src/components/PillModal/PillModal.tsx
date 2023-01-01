import Modal from "react-modal";
import React, {CSSProperties} from "react";
import {useMediaQuery} from "react-responsive";
import {XIcon} from "@heroicons/react/solid";
import './PillModal.css'

interface Props {
  children: any
  isOpen: boolean
  onClose: () => void
  title: string
}

const PillModal = (props: Props) => {
  const isMobile = useMediaQuery({query: '(max-width: 750px)'})
  let styles: CSSProperties
  if (isMobile) {
    styles = {
      backgroundColor: '#ffffff',
      borderRadius: '0',
      resize: 'none',
      top: '0',
      left: '0',
      right: '0',
      paddingLeft: '0',
      paddingRight: '0',
      paddingTop: '0',
      paddingBottom: '25px'
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
      width: '800px',
      padding: '0'
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
      <div className='pill-modal-header'>
        <div className='pill-modal-dummy'></div>
        <div className='pill-modal-title'>{props.title}</div>
        <div className='pill-modal-close-button' onClick={props.onClose}>
          <XIcon />
        </div>
      </div>
      <div className='pill-modal-content-wrapper'>
        {props.children}
      </div>
    </Modal>
  )
}

export default PillModal
