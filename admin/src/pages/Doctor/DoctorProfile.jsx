import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctortContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext);
  const { currency, backendUrl } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        about: profileData.about,
        available: profileData.available,
      };
      const { data } = await axios.post(`${backendUrl}/api/doctor/update-profile`, updateData, { headers: { dToken } });
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  if (!profileData) return null;

  return (
    <div className="m-5">
      <div className="flex flex-col gap-4">
        <div>
          <img src={profileData.image} alt={profileData.name} className="bg-primary/80 w-full sm:max-w-64 rounded-lg" />
        </div>

        <div className="flex-1 border border-stone-100 rounded-lg p-8 bg-white">
          {/* Name & Info */}
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">{profileData.name}</p>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <p>{profileData.degree} - {profileData.speciality}</p>
            <span className="py-0.5 px-2 border text-xs rounded-full">{profileData.experience}</span>
          </div>

          {/* About */}
          <div className="mt-3">
            <p className="text-sm font-medium text-[#262626]">About:</p>
            {isEdit ? (
              <textarea
                rows={8}
                className="w-full outline-primary p-2 mt-1"
                value={profileData.about}
                onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
              />
            ) : (
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">{profileData.about}</p>
            )}
          </div>

          {/* Fees */}
          <p className="text-gray-600 font-medium mt-4">
            Appointment fee: 
            <span className="text-gray-800">
              {currency}{' '}
              {isEdit ? (
                <input
                  type="number"
                  value={profileData.fees}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                  className="ml-1 px-1 border rounded"
                />
              ) : (
                profileData.fees
              )}
            </span>
          </p>

          {/* Address */}
          <div className="flex gap-2 mt-3">
            <p className="font-medium">Address:</p>
            <div className="text-sm">
              {isEdit ? (
                <>
                  <input
                    type="text"
                    value={profileData.address.line1}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                    className="block mb-1 border px-1 rounded"
                  />
                  <input
                    type="text"
                    value={profileData.address.line2}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                    className="block border px-1 rounded"
                  />
                </>
              ) : (
                <>
                  <p>{profileData.address.line1}</p>
                  <p>{profileData.address.line2}</p>
                </>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-1 mt-3">
            <input
              type="checkbox"
              checked={profileData.available}
              onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
            />
            <label>Available</label>
          </div>

          {/* Action Button */}
          <button
            onClick={isEdit ? updateProfile : () => setIsEdit(true)}
            className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
          >
            {isEdit ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
