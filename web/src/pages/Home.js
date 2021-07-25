import React, {Component} from 'react';
import {Card} from "semantic-ui-react";
import Post from "../components/Post/Post";

require('promise.prototype.finally').shim();

export default (props) => {
  const postData = {
    author: {
      id: "ktt",
      favicon: "kusuou.PNG",
    },
    created_at: 129888924798234,
    content: "ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
    is_public: false,
    circles: ["a", "b"],
    reactions: [{
      emoji: "😀",
      count: 1
    },
      {
        emoji: "😚",
        count: 10
      }],
    comments: [{
      author: {
        id: "ika",
        favicon: "kusuou.PNG",
        content: "hi"
      },
      reactions: [],
    }]
  }

  return (
    <div>
      <Post data={postData}/>
      <div>End of stream</div>
    </div>
  )

}
