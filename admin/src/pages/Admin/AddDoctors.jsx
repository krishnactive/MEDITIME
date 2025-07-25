import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import Loader from '../../components/Loader';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('1 Year');
  const [fees, setFees] = useState('');
  const [about, setAbout] = useState('');
  const [speciality, setSpeciality] = useState('General physician');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  const [loading, setLoading] = useState(false);  

  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docImg) return toast.error('Please select an image');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', about);
      formData.append('speciality', speciality);
      formData.append('degree', degree);
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

      const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
        headers: { aToken }
      });
    //   console.log(data);

      if (data.success) {
        toast.success(data.message);
        setDocImg(null);
        setName('');
        setEmail('');
        setPassword('');
        setExperience('1 Year');
        setFees('');
        setAbout('');
        setSpeciality('General physician');
        setDegree('');
        setAddress1('');
        setAddress2('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }finally {
      setLoading(false);
    }
  };

  return (
    <>
   
    {loading && <Loader text="Adding doctor..." />}
    <form onSubmit={handleSubmit} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        {/* Upload Image */}
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Doctor preview"
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
            />
          </label>
          <input
            type="file"
            id="doc-img"
            name="image" 
            hidden
            accept="image/*"
            onChange={(e) => setDocImg(e.target.files[0])}
          />
          <p>Upload doctor<br />picture</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 text-gray-600">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p>Your name</p>
              <input
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <p>Doctor Email</p>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <p>Set Password</p>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <p>Experience</p>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="border rounded px-2 py-2 w-full"
              >
                {['1 Year', '2 Year', '3 Year', '4 Year', '5 Year', '6 Year', '8 Year', '9 Year', '10 Year'].map((year) => (
                  <option key={year} value={year}>{year.replace('Year', 'Years')}</option>
                ))}
              </select>
            </div>
            <div>
              <p>Fees</p>
              <input
                type="number"
                value={fees}
                required
                onChange={(e) => setFees(e.target.value)}
                placeholder="Doctor fees"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p>Speciality</p>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="border rounded px-2 py-2 w-full"
              >
                {['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist'].map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <p>Degree</p>
              <input
                type="text"
                value={degree}
                required
                onChange={(e) => setDegree(e.target.value)}
                placeholder="Degree"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <p>Address</p>
              <input
                type="text"
                value={address1}
                required
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Address 1"
                className="border rounded px-3 py-2 w-full mb-1"
              />
              <input
                type="text"
                value={address2}
                required
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Address 2"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2">About Doctor</p>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Write about doctor"
            rows={5}
            className="w-full px-4 pt-2 border rounded"
          />
        </div>

        <button
          type="submit"
            disabled={loading}
          className="cursor-pointer bg-primary px-10 py-3 mt-4 text-white rounded-full hover:bg-green-500 transition"
        >
            {loading ? 'Adding Doctor...' : 'Add Doctor'}
        </button>
      </div>
    </form>
     </>
  );
};

export default AddDoctor;
