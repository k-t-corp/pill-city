import Modal from "react-modal";
import React from "react";
import {useMediaQuery} from "react-responsive";

interface Props {
  children: any
  isOpen: boolean
  onClose: () => void
}

export default (props: Props) => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 750px)' })
  let modalStyles
  if (isTabletOrMobile) {
    modalStyles = {
      content: {
        overflow: 'scroll'
      },
    }
  } else {
    modalStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '800px'
      },
    }
  }

  return (
    <Modal
      isOpen={props.isOpen}
      style={modalStyles}
      onRequestClose={props.onClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      {props.children}
    </Modal>
  )
}
