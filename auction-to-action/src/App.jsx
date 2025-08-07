import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './Pages/Login';
import DashboardAdmin from './Pages/Admin/Dashboard.Admin';
import DashboardUser from './Pages/User/Dashboard.User';

function App() {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route exact path="/" element={<Login />} />
      <Route path="/admindashboard" element={<DashboardAdmin />} />
      <Route path="/userdashboard" element={<DashboardUser />} />
    </Routes>
  )
}

export default App
