import React from 'react';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";

require('promise.prototype.finally').shim();

export default (props) => {
  const postData = {
    author: {
      id: "ktt",
      favicon: "kusuou.PNG",
    },
    created_at: 129888924798234,
    content: "A commonly used entity in HTML is the non-breaking space: &nbsp;",
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
      },
      content: " This is handy when breaking the words might be disruptive.",
      created_at: 129888924798234,
      comments: [
        {
          author: {
            id: "ika",
            favicon: "kusuou.PNG",
          },
          content: "Igit To add real spaces to your text, you can use the &nbsp; character entity.",
          created_at: 129888924798234,
        }
      ]
    },{
      author: {
        id: "ika",
        favicon: "kusuou.PNG",
      },
      content: "This text is styled with some of the text formatting properties. The heading uses the text-align, text-transform, and color properties. The paragraph is indented, aligned, and the space between characters is specified. The underline is removed from this colored \"Try it Yourself\" link.",
      created_at: 129888924798234,
      comments: []
    },
    ]
  }

  const newPostData = {
    user: {
      id: "ika",
      favicon: "kusuou.PNG",
    }
  }

  return (
    <div className="home-wrapper">
      <div className="home-posts-wrapper">
        <Post data={postData}/>
      </div>
      <div className="home-new-post-wrapper">
        <NewPost data={newPostData}/>
      </div>
    </div>
  )

}
