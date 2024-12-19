import { Route, Routes, BrowserRouter } from "react-router-dom";
import MainWrapper from "./layouts/MainWrapper"
import Index from "./views/core/Index";
import About from "./views/pages/About";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Logout from "./views/auth/Logout";
import Profile from "./views/pages/Profile";
import PrivateRoute from "./layouts/PrivateRoute";
import ProjectDetails from "./views/core/ProjectDetail";
import ProjectCreate from "./views/core/ProjectCreate";
import ShotList from "./views/project/ShotLists/ShotList";
import Storyboards from "./views/project/Storyboards/Storyboards";
import Schedules from "./views/project/Schedules/Schedules";
import Budget from "./views/project/Budget/Budget";
import Tasks from "./views/project/Tasks/Tasks";
import ProjectScriptsPage from "./views/project/Scripts/ScriptsPage";
import ScriptDetail from "./views/project/Scripts/ScriptDetail";


function App() {
    return (
        <>
            <BrowserRouter>
                <MainWrapper>
                    <Routes>
                        <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />

                        {/* Authentication */}
                        <Route path="/register/" element={<Register />} />
                        <Route path="/login/" element={<Login />} />
                        <Route path="/logout/" element={<Logout />} />

                        {/* Pages */}
                        <Route path="/profile/" element={<Profile />} />
                        <Route path="/about/" element={<About />} />

                        {/*Project*/}
                        <Route path="/project/:projectid" element={<ProjectDetails />} />
                        <Route path="/project/create" element={<ProjectCreate />} />
                        
                        <Route path="/project/:projectid/scripts" element={<ProjectScriptsPage />} />
                        <Route
                            path="/project/:projectid/scripts/:scriptid"
                            element={<ScriptDetail />}
                        />
                        <Route path="/project/:projectid/shot-lists" element={<ShotList />} />
                        <Route path="/project/:projectid/storyboards" element={<Storyboards />} />
                        <Route path="/project/:projectid/schedule" element={<Schedules />} />
                        <Route path="/project/:projectid/budget" element={<Budget />} />
                        <Route path="/project/:projectid/tasks" element={<Tasks />} />

                    </Routes>     
                </MainWrapper>
            </BrowserRouter>
        </>
    );
}

export default App;