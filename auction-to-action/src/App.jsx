import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import UserDashboard from "./Pages/User/Dashboard.User";
import AdminDashboard from "./Pages/Admin/Dashboard/Dashboard.Admin";
import ProtectedAdminRoute from "./Components/ProtectedAdminRoute";
import RulesUser from "./Components/User/Rules.User";

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Login />} />
      <Route path="/userdashboard" element={<UserDashboard />} />
      <Route path="/rules" element={<RulesUser />} />
      <Route 
        path="/admindashboard" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
    </Routes>
  );
}

export default App;
