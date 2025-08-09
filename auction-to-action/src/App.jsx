import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import DashboardAdmin from "./Pages/Admin/Dashboard.Admin";
import DashboardUser from "./Pages/User/Dashboard.User";
import AdminLogin from "./Pages/Admin/Admin.Login.jsx";
import UserLogin from "./Pages/User/User.Login.jsx";

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/user-login" element={<UserLogin />} />
      <Route path="/admindashboard" element={<DashboardAdmin />} />
      <Route path="/userdashboard" element={<DashboardUser />} />
    </Routes>
  );
}

export default App;
