import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import FloatingChat from '../components/FloatingChat'
import UploadReport from './UploadReport'
const Home = () => {
  return (
    <div>
      <Header/>
      <SpecialityMenu/>
      <TopDoctors/>
      <FloatingChat />
      <UploadReport />
      <Banner/>
    </div>
  )
}

export default Home
