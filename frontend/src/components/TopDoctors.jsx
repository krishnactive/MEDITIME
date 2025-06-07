import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  return (
    <div className="flex flex-col items-center gap-4 my-16 px-4 md:px-10 text-gray-900">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-blue-700">Top Doctors to Book</h1>
      <p className="sm:w-1/2 text-center text-gray-500 text-sm">
        Simply browse through our curated list of highly-rated and trusted medical professionals.
      </p>

      {/* Doctor Cards */}
      <div className="w-full grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {doctors.slice(0, 10).map((doc, index) => (
          <div
            key={index}
            onClick={()=>{navigate(`/appointment/${doc._id}`); scrollTo(0,0)}}
            className="cursor-pointer border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          >
            <img
                src={doc.image}
                alt={`${doc.name} profile`}
                className="w-full aspect-[4/5] object-cover object-top bg-blue-50 group-hover:brightness-110 transition duration-300"
            />

            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p>Available</p>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
              <p className="text-sm text-gray-600">{doc.speciality}</p>
              <p className="text-xs text-gray-400 mt-1">{doc.experience}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <button
        onClick={() => {
          navigate('/doctors');
          scrollTo(0, 0);
        }}
        className="mt-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-2 rounded-full shadow hover:opacity-90 transition duration-300"
      >
        View More Doctors
      </button>
    </div>
  );
};

export default TopDoctors;
