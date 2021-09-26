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
    <p className='about'>
      Web {webGitCommit ? githubLink(webGitCommit) : '?'}{', '}
      API {apiGitCommit ? githubLink(apiGitCommit) : '?'}{', '}
      <a
        href="https://github.com/KTachibanaM/pill-city/issues"
        target='_blank'
        rel='noopener noreferrer'
        className='about-commit-link'
      >Issues</a>{', '}
      <a
        href="https://github.com/KTachibanaM/pill-city/issues/new"
        target='_blank'
        rel='noopener noreferrer'
        className='about-commit-link'
      >New issue</a>
    </p>
  )
}
