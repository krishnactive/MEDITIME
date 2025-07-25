import React, { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../context/DoctortContext';
import { AdminContext } from '../context/AdminContext';

const Login = () => {
  const [role, setRole] = useState('Admin');       // 'Admin' or 'Doctor'
  const [email, setEmail] = useState('');         
  const [password, setPassword] = useState('');    
  const [loading, setLoading] = useState(false);   

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);

  //Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const endpoint = role === 'Admin' ? '/api/admin/login' : '/api/doctor/login';
      const { data } = await axios.post(`${backendUrl}${endpoint}`, { email, password });

      if (data.success) {
        const token = data.token;
        console.log(token);
        if (role === 'Admin') {
          setAToken(token);
          localStorage.setItem('aToken', token);
        } else {
          setDToken(token);
          localStorage.setItem('dToken', token);
        }
        toast.success(`${role} login successful!`);
      } else {
        toast.error(data.message || 'Login failed.');
      }

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  //Toggle between Admin and Doctor login
  const toggleRole = () => {
    setRole(prev => (prev === 'Admin' ? 'Doctor' : 'Admin'));
  };

  return (
    
    <form onSubmit={handleLogin} className="min-h-[80vh] flex items-center justify-center">
      {/* <div className='text-#84CC16 text-left px-5'>dfasf</div>
      <button className="bg-[#84CC16] text-#84CC16">Click mkmmkkllk</button> */}

      <div className="flex flex-col gap-4 p-8 w-[340px] sm:w-96 border rounded-xl shadow-lg text-gray-700">
        <h2 className="text-2xl font-semibold text-center">
          <span className="text-primary">{role}</span> Login
        </h2>

        <div className="w-full">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded w-full p-2 focus:outline-[#84CC16]"
          />
        </div>

        <div className="w-full">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded w-full p-2 focus:outline-[#84CC16]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-base text-white bg-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-sm text-center">
          {role === 'Admin' ? (
            <>Doctor Login? <span onClick={toggleRole} className="text-primary underline cursor-pointer">Click here</span></>
          ) : (
            <>Admin Login? <span onClick={toggleRole} className="text-primary underline cursor-pointer">Click here</span></>
          )}
        </p>
      </div>
    </form>
  );
};

export default Login;
