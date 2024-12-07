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
import ShotLists from "./views/project/ShotLists";
import Storyboards from "./views/project/Storyboards";
import Schedules from "./views/project/Schedules";
import Budget from "./views/project/Budget";
import Tasks from "./views/project/Tasks";
import ProjectScriptsPage from "./views/project/ScriptsPage";
import ScriptDetail from "./views/project/ScriptDetail";

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
                        <Route path="/project/:id" element={<ProjectDetails />} />
                        <Route path="/project/create" element={<ProjectCreate />} />
                        
                        <Route path="/project/:projectid/scripts" element={<ProjectScriptsPage />} />
                        <Route
                            path="/project/:projectid/scripts/:scriptid"
                            element={<ScriptDetail />}
                        />
                        <Route path="/project/:id/shot-lists" element={<ShotLists />} />
                        <Route path="/project/:id/storyboards" element={<Storyboards />} />
                        <Route path="/project/:id/schedule" element={<Schedules />} />
                        <Route path="/project/:id/budget" element={<Budget />} />
                        <Route path="/project/:id/tasks" element={<Tasks />} />

                    </Routes>     
                </MainWrapper>
            </BrowserRouter>
        </>
    );
}

export default App;