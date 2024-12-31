import React, { useState } from "react";
import Modal from "react-modal";
import Scripts from "./Scripts";
import AddScriptForm from "./AddScriptForm";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import SidePanel from "../../partials/SidePanel";

Modal.setAppElement("#root");

const ProjectScriptsPage = () => {
  const [refreshList, setRefreshList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScriptAdded = () => {
    setRefreshList((prev) => !prev);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <SidePanel />
        <div className="main-content">
          <button onClick={openModal}>Add New Script</button>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Add Script Modal"
            className="custom-modal"
            overlayClassName="custom-overlay"
          >
            <AddScriptForm onScriptAdded={handleScriptAdded} onClose={closeModal} />
          </Modal>
          <Scripts key={refreshList} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectScriptsPage;
