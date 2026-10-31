import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const onGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential || loading) {
      toast.error('Google sign-in did not return a credential. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/google-login`, {
        credential: credentialResponse.credential,
      });

      if (!data.success || !data.token) {
        toast.error(data.message || 'Google sign-in failed. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      toast.success('Logged in successfully!');
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      toast.error(error.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div className='min-h-[80vh] flex items-center justify-center'>
      <div className='flex flex-col gap-4 m-auto items-center p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold text-gray-800'>Welcome to MediTime</p>
        <p className='text-center'>Sign in with your Google account to book appointments.</p>

        {googleClientId ? (
          loading ? (
            <p role='status'>Signing in...</p>
          ) : (
            <div className='flex justify-center w-full mt-2'>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => toast.error('Google sign-in was cancelled or failed. Please try again.')}
                text='continue_with'
                shape='pill'
                width='300'
              />
            </div>
          )
        ) : (
          <p className='text-center text-red-600'>
            Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID for the patient app.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
