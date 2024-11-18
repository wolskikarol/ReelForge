import React from "react"
import Header from "../partials/Header"
import Footer from "../partials/Footer"
import { Link } from "react-router-dom"
import ProjectList from "./ProjectList"

function Index() {



    return (
        <div className="app">
            <Header />
                <div className="app-content">
                    <ProjectList/>
                    <Link className="button" to={'/project/create/'}>Create new Project
                    </Link>
                </div>
            <Footer />
        </div>
    );
}

export default Index;