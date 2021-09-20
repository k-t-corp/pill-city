import React, { useEffect, useState } from 'react'
import './About.css'

export default (props) => {
  const webGitCommit = process.env.REACT_APP_GIT_SHA
  const [apiGitCommit, updateApiGitCommit] = useState(undefined)
  useEffect(async () => {
    updateApiGitCommit(await props.api.getApiGitCommit())
  }, [])

  const githubLink = (commit) => {
    return <a href={`https://github.com/KTachibanaM/pill-city/commit/${commit}`} className='about-commit-link'>{commit}</a>
  }

  return (
    <p className='about'>Web {webGitCommit ? githubLink(webGitCommit) : '?'}, API {apiGitCommit ? githubLink(apiGitCommit) : '?'}</p>
  )
}
