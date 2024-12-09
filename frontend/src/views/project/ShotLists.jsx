import React from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import SidePanel from '../partials/SidePanel'

const ShotLists = () => {
  return (
<div className='app-container'>
    <Header />
    <div className="content-container">
        <SidePanel />
        <div className="main-content">
        <div>ShotLists</div>
        </div>
    </div>
    <Footer />
</div>  )
}
export default ShotLists