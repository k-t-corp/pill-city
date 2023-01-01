import React, {useState} from "react";
import './PillTabs.css'

interface Tab {
  title: string
  el: JSX.Element
}

interface Props {
  tabs: Tab[]
}

const PillTabs = (props: Props) => {
  const [showingTab, updateShowingTab] = useState(0)

  return (
    <>
      <div className='pill-tabs'>
        {
          props.tabs.map((tab, index) => {
            return (
              <div
                className={'pill-tab' + (showingTab === index ? ' pill-tab-selected' : '')}
                onClick={() => {updateShowingTab(index)}}
              >{tab.title}</div>
            )
          })
        }
      </div>
      <div>
        {props.tabs[showingTab].el}
      </div>
    </>
  )
}

export default PillTabs
