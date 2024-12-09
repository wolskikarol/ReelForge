import React from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import SidePanel from '../partials/SidePanel'

const Storyboards = () => {
  return (
<div className='app-container'>
    <Header />
    <div className="content-container">
        <SidePanel />
        <div className="main-content">
        <div>Storyboards</div>
        </div>
    </div>
    <Footer />
</div>  )
}
export default Storyboards