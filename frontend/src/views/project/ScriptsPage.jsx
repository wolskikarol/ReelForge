import React, { useState } from "react";
import Scripts from "./Scripts";
import AddScriptForm from "./AddScriptForm";
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import SidePanel from '../partials/SidePanel'

const ProjectScriptsPage = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleScriptAdded = () => {
    setRefreshList((prev) => !prev);
  };

  return (
<div className='app-container'>
    <Header />
    <div className="content-container">
        <SidePanel />
        <div className="main-content">      <Scripts key={refreshList} />
      <hr />
      <AddScriptForm onScriptAdded={handleScriptAdded} />
      </div>
    </div>
    <Footer />
</div>  );
};

export default ProjectScriptsPage;
