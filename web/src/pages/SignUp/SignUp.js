import React from 'react';
import HomePage from "../../components/HomePage/HomePage";
import withApi from "../../hoc/withApi";
import withNoAuthRedirect from "../../hoc/withNoAuthRedirect";
import api from "../../api/Api";
import "./SignUp.css";

const LoginForm = () => {
  return (
    <div className='login-form'>
      <h1 className='login-form-title'>Sign up</h1>
      <input
        className="login-form-input"
        type="text"
        placeholder="* ID, e.g. kt"
      />
      <input
        className="login-form-input"
        type="text"
        placeholder="Display name, e.g. 大 KT"
      />
      <input
        className="login-form-input"
        type="email"
        placeholder="Email (optional)"
      />
      <input
        className="login-form-input"
        type="password"
        placeholder="* Password"
      />
      <input
        className="login-form-input"
        type="password"
        placeholder="* Confirm password"
      />
      <input
        className="login-form-input"
        type="text"
        placeholder="* Invitation code"
      />
      <div className="login-form-button">Sign up</div>
      <div className="message-box-sign-in">
        Already have an account? <a className="sign-in-link" href='/signin'>Sign in here</a>
      </div>
    </div>
  )
}

const SignUp = () => {
  return (
    <HomePage formElement={<LoginForm />}/>
  )
}

// class SignUp extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       'error': '',
//       'buttonEnabled': false,
//       'loading': false,
//       'redirectToSignIn': false,
//       'isOpenRegistration': true
//     }
//   }
//
//   componentDidMount() {
//     this.props.api.isOpenRegistration()
//       .then(isOpenRegistration => {
//         this.setState({
//           isOpenRegistration
//         })
//       })
//       .catch(error => {
//         this.setState({
//           error: error.toString()
//         })
//       })
//   }
//
//   handleFormValid = () => {
//     this.setState({'buttonEnabled': true})
//   }
//
//   handleFormInvalid = () => {
//     this.setState({'buttonEnabled': false})
//   }
//
//   showError = (err) => {
//     this.setState({'error': err.toString()})
//   }
//
//   handleSubmit = (inputForm) => {
//     const idRegex = /^[A-Za-z0-9_-]+$/i;
//     const {id, displayName, password, confirmPassword, invitationCode} = inputForm
//     if (id === undefined || id.trim() === "" || id.trim().length > 15 || !id.trim().match(idRegex)) {
//       this.refs.form.updateInputsWithError({
//         'id': 'Please enter a valid id. An valid id is max 15 characters long, and only consists of numbers, ' +
//           'English letters, underscores and dashes.',
//       })
//       return
//     }
//     if (password === undefined || password.trim === "") {
//       this.refs.form.updateInputsWithError({
//         'password': 'Please enter password',
//       })
//       return
//     } else if (password !== confirmPassword) {
//       this.refs.form.updateInputsWithError({
//         'confirmPassword': 'Password does not match'
//       })
//       return
//     } else if (!this.state.isOpenRegistration && !invitationCode) {
//       this.refs.form.updateInputsWithError({
//         'invitationCode': 'Please enter invitation code'
//       })
//       return
//     }
//
//     this.setState({'loading': true})
//     this.props.api.signUp(id.trim(), displayName, password, invitationCode)
//       .then(() => {
//         this.setState({'redirectToSignIn': true})
//       })
//       .catch((e) => {
//         if (e.response.status === 409) {
//           this.refs.form.updateInputsWithError({
//             'id': 'This id has already been taken',
//           })
//         } else if (e.response.status === 403) {
//           this.refs.form.updateInputsWithError({
//             'invitationCode': 'Invalid invitation code',
//           })
//         }
//       })
//       .finally(() => {
//         this.setState({'loading': false})
//       })
//   }
//
//   loginForm = () => {
//     const errorLabel = <Label color="red" as="small" pointing/>
//     return (
//       <div className='login-form'>
//         <Grid textAlign='center' style={{height: '100%'}} verticalAlign='middle'>
//           <GridColumn style={{maxWidth: 450}}>
//             <div className="sign-up-title">
//               Sign up
//             </div>
//             <Form
//               ref='form'
//               size='medium'
//               loading={this.state.loading}
//               onValid={this.handleFormValid}
//               onInvalid={this.handleFormInvalid}
//               onValidSubmit={this.handleSubmit}
//             >
//               <div className="signup-form-wrapper">
//                 <Input
//                   fluid
//                   name='id'
//                   placeholder='* ID, e.g. kt'
//                   errorLabel={errorLabel}
//                 />
//                 <Input
//                   fluid
//                   name='displayName'
//                   placeholder='Display name, e.g. 大 KT'
//                   errorLabel={errorLabel}
//                 />
//                 <Input
//                   fluid
//                   name='password'
//                   placeholder='* Password'
//                   type='password'
//                   errorLabel={errorLabel}
//                 />
//                 <Input
//                   fluid
//                   name='confirmPassword'
//                   placeholder='* Confirm password'
//                   type='password'
//                   errorLabel={errorLabel}
//                 />
//                 {
//                   this.state.isOpenRegistration ?
//                     null :
//                     <Input
//                       fluid
//                       name='invitationCode'
//                       placeholder='* Invitation code'
//                       errorLabel={errorLabel}
//                     />
//                 }
//                 <Button
//                   fluid
//                   primary
//                   size='large'
//                   disabled={!this.state.buttonEnabled}
//                 >
//                   Sign up
//                 </Button>
//               </div>
//             </Form>
//             {this.state.error &&
//             <Message negative>
//               {this.state.error}
//             </Message>
//             }
//             <div className="message-box-sign-in">
//               Already have an account? <a className="sign-in-link" href='/signin'>Sign in here</a>
//             </div>
//           </GridColumn>
//         </Grid>
//       </div>
//     )
//   }
//
//   render() {
//     if (this.state.redirectToSignIn) {
//       return <Redirect to={'/signin'}/>
//     }
//
//     return (
//       <HomePage formElement={this.loginForm()}/>
//     )
//   }
// }

export default withApi(withNoAuthRedirect(SignUp), api)
