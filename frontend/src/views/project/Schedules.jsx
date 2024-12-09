import React from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import SidePanel from '../partials/SidePanel'

const Schedules = () => {
  return (
    <div className='app-container'>
        <Header />
        <div className="content-container">
            <SidePanel />
            <div className="main-content">
            <div>Schedules</div>
            </div>
        </div>
        <Footer />
    </div>
    )
}
export default Schedules