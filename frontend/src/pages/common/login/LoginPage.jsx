import React, {useState} from 'react'
import LoginForm from './LoginForm';
import { Link } from 'react-router-dom';

const LoginPage = () => {

  return (
    <div className='container mt-5 text-center'>
      <h1>Login</h1>
      <LoginForm />
      <p>Not a user yet? Signup <Link to='/signup'>here</Link>.</p>
    </div>
  )
}

export default LoginPage;