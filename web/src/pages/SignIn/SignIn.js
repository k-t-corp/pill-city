import React, {Component} from 'react';
import {Button, Grid, Message, Label} from "semantic-ui-react";
import {Form, Input} from 'formsy-semantic-ui-react'
import HomePage from "../../components/HomePage/HomePage";
import "./SignIn.css"
import withApi from "../../hoc/withApi";
import withNoAuthRedirect from "../../hoc/withNoAuthRedirect";
import api from "../../api/Api";

class SignIn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      'error': '',
      'loading': false,
      'buttonEnabled': false,
    }
  }

  handleFormValid = () => {
    this.setState({'buttonEnabled': true})
  }
  handleFormInvalid = () => {
    this.setState({'buttonEnabled': false})
  }
  showError = (err) => {
    this.setState({'error': err.toString()})
  }
  handleSubmit = (inputForm) => {
    const {id, password} = inputForm

    this.setState({'loading': true})
    this.props.api.signIn(
      id, password
    ).then(() => {
      // This is needed so that the App component is fully reloaded
      // so that getting the first home page and auto refresh is enabled
      window.location.href = '/'
    }).catch( e => {
        if (e.response.status === 401) {
          this.refs.form.updateInputsWithError({
            'password': 'invalid id or password'
          })
        }
      }
    ).finally(() => {
      this.setState({'loading': false})
    })
  }

  render() {
    const errorLabel = <Label color="red" pointing/>

    const loginForm = () => {
      return (
        <div className='login-form'>
          <Grid textAlign='center' style={{height: '100%'}} verticalAlign='middle'>
            <Grid.Column style={{maxWidth: 450}}>
              <div className="sign-in-title">
                Sign in
              </div>
              <Form
                ref='form'
                size='large'
                loading={this.state.loading}
                onValid={this.handleFormValid}
                onInvalid={this.handleFormInvalid}
                onValidSubmit={this.handleSubmit}
              >
                <div className="sign-in-form-wrapper">
                  <Input
                    fluid
                    name='id'
                    placeholder='ID'
                    required
                    errorLabel={errorLabel}
                  />
                  <Input
                    fluid
                    name='password'
                    placeholder='Password'
                    type='password'
                    required
                    errorLabel={errorLabel}
                  />
                  <Button
                    primary
                    fluid
                    size='large'
                    disabled={!this.state.buttonEnabled}
                  >
                    Sign in
                  </Button>
                </div>
              </Form>
              {this.state.error &&
              <Message negative>
                {this.state.error}
              </Message>
              }
              <div className="message-box-sign-up">
                Don't have an account? <a className="sign-in-link" href='/signup'>Sign up here</a>
              </div>
            </Grid.Column>
          </Grid>
        </div>
      )
    }

    return (
      <HomePage formElement={loginForm()}/>
    )
  }
}

export default withApi(withNoAuthRedirect(SignIn), api)
