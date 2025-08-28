import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import AdminLogin from "./Pages/Admin/Admin.Login";
import UserDashboard from "./Pages/User/Dashboard.User";
import MyBids from "./Pages/User/MyBids";
import TeamBids from "./Pages/User/TeamBids";
{
  /*import AdminDashboard from "./Pages/Admin/Dashboard.Admin"; */
}

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      {/*<Route path="/admindashboard" element={<AdminDashboard />} /> */}
      <Route path="/userdashboard" element={<UserDashboard />} />
      <Route path="/my-bids" element={<MyBids />} />
      <Route path="/team-bids" element={<TeamBids />} />
    </Routes>
  );
}

export default App;
