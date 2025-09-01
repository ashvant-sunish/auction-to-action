import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import AdminLogin from "./Pages/Admin/Admin.Login";
import UserDashboard from "./Pages/User/Dashboard.User";
import AdminDashboard from "./Pages/Admin/Dashboard/Dashboard.Admin";

import TestAdmin from "./Pages/Admin/Dashboard/test.admin";

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Login />} />
      <Route path="/userdashboard" element={<UserDashboard />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/test" element={<TestAdmin />} />
    </Routes>
  );
}

export default App;
