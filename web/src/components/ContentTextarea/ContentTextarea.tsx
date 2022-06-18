import React from "react";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import MentionAutoCompleteLoading from "./MentionAutoCompleteLoading";
import MentionAutoCompleteUserItem from "./MentionAutoCompleteUserItem";
import User from "../../models/User";
import api from '../../api/Api'
import "@webscopeio/react-textarea-autocomplete/style.css";

interface Props {
  content: string
  onChange: (newContent: string) => void
  onAddMedia: (fl: FileList) => void
  disabled: boolean
  textAreaClassName?: string
  placeholder?: string
}

export default (props: Props) => {
  return (
    <ReactTextareaAutocomplete<User>
      className={props.textAreaClassName}
      value={props.content}
      onChange={(e: any) => {
        props.onChange(e.target.value)
      }}
      disabled={props.disabled}
      placeholder={props.placeholder}
      loadingComponent={MentionAutoCompleteLoading}
      trigger={{
        "@": {
          dataProvider: (keyword) => api.searchUsers(keyword),
          component: MentionAutoCompleteUserItem,
          output: (item, trigger) => trigger+item.id,
          allowWhitespace: true
        }
      }}
      style={{
        fontSize: '13.333px'
      }}
      itemStyle={{
        fontSize: '13.333px'
      }}
      dropdownStyle={{
        zIndex: 999
      }}
      onPaste={e => {
        const files = e.clipboardData.files
        if (files.length === 0) {
          return
        }
        for (let i = 0; i < files.length; ++i) {
          const f = files[i]
          if (!f.type.startsWith("image/")) {
            return
          }
        }
        e.preventDefault()
        props.onAddMedia(files)
      }}
    />
  )
}
