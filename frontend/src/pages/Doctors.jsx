import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  }

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  return (
    <div className="px-4 md:px-10 my-8 text-gray-900">
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>

        {/* Filters */}
        <button 
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white':''}`}
          onClick={() => setShowFilter(prev => !prev)}
        >
          Filters
        </button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          {['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Gastroenterologist', 'Neurologist'].map((item, index) => (
            <p
              key={index}
              onClick={() => speciality === item ? navigate('/doctors') : navigate(`/doctors/${item}`)}
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === item ? "bg-indigo-100 text-black" : ""}`}
            >
              {item}
            </p>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className='w-full grid gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filterDoc.map((item, index) => (
            <div
              key={index}
              onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0,0); }}
              className="cursor-pointer border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
            >
              <img
                src={item.image}
                alt={`${item.name} profile`}
                className="w-full aspect-[4/5] object-cover object-top bg-blue-50 group-hover:brightness-110 transition duration-300"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className={`w-2 h-2 ${item.available ? 'bg-green-500':'bg-gray-500'} rounded-full animate-pulse`}></span>
                  <p className={`${item.available ? 'text-green-500':'text-gray-500'}`}>{item.available ? 'Available' : 'Unavailable'}</p>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.speciality}</p>
                <p className="text-xs text-gray-400 mt-1">{item.experience}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Doctors
