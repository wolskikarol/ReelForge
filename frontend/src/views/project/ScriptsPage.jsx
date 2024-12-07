import React, { useState } from "react";
import Scripts from "./Scripts";
import AddScriptForm from "./AddScriptForm";

const ProjectScriptsPage = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleScriptAdded = () => {
    setRefreshList((prev) => !prev);
  };

  return (
    <div>
      <Scripts key={refreshList} />
      <hr />
      <AddScriptForm onScriptAdded={handleScriptAdded} />
    </div>
  );
};

export default ProjectScriptsPage;
