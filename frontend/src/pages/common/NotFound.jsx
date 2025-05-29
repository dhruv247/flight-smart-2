import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Not Found - used for invalid routes
 */
const NotFound = () => {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '100vh' }}>
        <h1 className='text-danger'>404</h1>
        <h3>Page Not Found</h3>
        <Link to='/' className='btn btn-primary'>Go to Flight Smart</Link>
    </div>
  )
}

export default NotFound