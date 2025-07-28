import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom';

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const [relDoc, setRelDoc] = useState([]);

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId);
      setRelDoc(doctorsData);
    }
  }, [doctors, speciality, docId])

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
      <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm text-gray-500'>Simply browse through our extensive list of trusted doctors.</p>

      <div className='w-full grid gap-6 pt-5 px-3 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {relDoc.slice(0, 5).map((item, index) => (
          <div
            key={index}
            onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0); }}
            className="cursor-pointer border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          >
            <img
              src={item.image}
              alt={`${item.name} profile`}
              className="w-full aspect-[4/5] object-cover object-top bg-blue-50 group-hover:brightness-110 transition duration-300"
            />
            <div className='p-4'>
              <div className='flex items-center gap-2 text-xs mb-1'>
                <span className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full animate-pulse`}></span>
                <p className={`${item.available ? 'text-green-500' : 'text-gray-500'}`}>{item.available ? 'Available' : 'Unavailable'}</p>
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>{item.name}</h3>
              <p className='text-sm text-gray-600'>{item.speciality}</p>
              <p className='text-xs text-gray-400 mt-1'>{item.experience}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { navigate('/doctors'); scrollTo(0, 0); }}
        className='mt-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-2 rounded-full shadow hover:opacity-90 transition duration-300'
      >
        View More Doctors
      </button>
    </div>
  )
}

export default RelatedDoctors
