import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';

const App = () => {

  const { aToken } = useContext(AdminContext);

  return aToken ? (
    <div>
      <ToastContainer/>
      <Navbar />
    </div>
    )
    :(
    <>
      <Login/>
      <ToastContainer/>
    </>)
  
}

export default App
