import React, { useEffect, useState } from 'react'
import api from '../../api/Api'
import './About.css'

const About = () => {
  const webGitCommit = process.env.REACT_APP_GIT_SHA
  const [apiGitCommit, updateApiGitCommit] = useState(undefined)
  useEffect(() => {
    const _fetch = async () => {
      updateApiGitCommit(await api.getApiGitCommit())
    }
    _fetch()
  }, [])

  const githubLink = (commit) => {
    return <a href={`https://github.com/pill-city/pill-city/commit/${commit}`} className='about-commit-link'>{commit}</a>
  }

  return (
    <p className='about'>
      Web {webGitCommit ? githubLink(webGitCommit) : '?'}{', '}
      API {apiGitCommit ? githubLink(apiGitCommit) : '?'}{', '}
      <a
        href="https://github.com/k-t-corp/pill-city"
        target='_blank'
        rel='noopener noreferrer'
        className='about-commit-link'
      >GitHub.</a>
    </p>
  )
}

export default About;
