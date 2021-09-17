import React, {useEffect, useState} from 'react'
import './About.css'

export default (props) => {
  const webGitCommit = process.env.REACT_APP_GIT_SHA
  const [apiGitCommit, updateApiGitCommit] = useState(undefined)
  useEffect(async () => {
    updateApiGitCommit(await props.api.getApiGitCommit())
  })

  const githubLink = (commit) => {
    return <a href={`https://github.com/KTachibanaM/pill-city/commit/${commit}`} className='about-commit-link'>{commit}</a>
  }

  const youMayHitABug = () => {
    return <span>. <span className='about-you-may-hit-a-bug'>You may hit a bug</span></span>
  }

  return (
    <p className='about'>Web {webGitCommit ? githubLink(webGitCommit) : '?'}, API {apiGitCommit ? githubLink(apiGitCommit) : '?'}{webGitCommit !== apiGitCommit ? youMayHitABug() : null}</p>
  )
}
