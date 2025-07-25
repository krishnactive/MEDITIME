import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [mode, setMode] = useState('Sign Up');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (mode === 'Sign Up') {
        response = await axios.post(`${backendUrl}/api/user/register`, form);
      } else {
        response = await axios.post(`${backendUrl}/api/user/login`, { email: form.email, password: form.password });
      }

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        toast.success(`${mode === 'Sign Up' ? 'Account created' : 'Logged in'} successfully!`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{mode === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {mode === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>

        {mode === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              name='name'
              value={form.name}
              onChange={handleChange}
              type='text'
              required
              className='border border-zinc-300 rounded w-full p-2 mt-1'
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input
            name='email'
            value={form.email}
            onChange={handleChange}
            type='email'
            required
            className='border border-zinc-300 rounded w-full p-2 mt-1'
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input
            name='password'
            value={form.password}
            onChange={handleChange}
            type='password'
            required
            className='border border-zinc-300 rounded w-full p-2 mt-1'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='bg-primary text-white w-full py-2 my-2 rounded-md text-base hover:bg-green-600 transition disabled:opacity-60'
        >
          {loading ? (mode === 'Sign Up' ? 'Creating...' : 'Logging in...') : (mode === 'Sign Up' ? 'Create account' : 'Login')}
        </button>

        {mode === 'Sign Up' ? (
          <p>Already have an account? <span onClick={() => setMode('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
        ) : (
          <p>Create a new account? <span onClick={() => setMode('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        )}
      </div>
    </form>
  );
};

export default Login;
