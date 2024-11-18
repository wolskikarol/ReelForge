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

function App() {
    return (
        <>
            <BrowserRouter>
                <MainWrapper>
                    <Routes>
                        <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
                        <Route path="/project/:id" element={<ProjectDetails />} />
                        <Route path="/project/create" element={<ProjectCreate />} />

                        {/* Authentication */}
                        <Route path="/register/" element={<Register />} />
                        <Route path="/login/" element={<Login />} />
                        <Route path="/logout/" element={<Logout />} />

                        {/* Pages */}
                        <Route path="/profile/" element={<Profile />} />
                        <Route path="/about/" element={<About />} />
                    </Routes>     
                </MainWrapper>
            </BrowserRouter>
        </>
    );
}

export default App;