import Modal from "react-modal";
import React from "react";
import {useMediaQuery} from "react-responsive";

interface Props {
  children: any
  isOpen: boolean
  onClose: () => void
}

export default (props: Props) => {
  let styles: any = {
    backgroundColor: '#ffffff',
    borderRadius: '5px',
    boxShadow: '2px 2px 1px 1px #e0e0e0',
    resize: 'none'
  }

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 750px)' })
  if (isTabletOrMobile) {
    styles = {
      ...styles,
      overflow: 'auto',
    }
  } else {
    styles = {
      ...styles,
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
      {props.children}
    </Modal>
  )
}
