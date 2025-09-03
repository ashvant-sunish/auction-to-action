import React, { useState, useEffect } from 'react'
import HeaderAdmin from '../../../Components/Admin/Header/Header.Admin';
import NavbarAdmin from '../../../Components/Admin/Navbar/Navbar.Admin';
import { Box } from '@chakra-ui/react';
import DashboardContentAdmin from '../../../Components/Admin/Content/DashboardContent.Admin';
import SettingsContentAdmin from '../../../Components/Admin/Content/SettingsContent.Admin';
import AdminManagementAdmin from '../../../Components/Admin/Content/AdminManagement.Admin';
import TeamsManagementAdmin from '../../../Components/Admin/Content/TeamsManagement.Admin';
import BidHistoryAdmin from '../../../Components/Admin/Content/BidHistory.Admin';
import RoundsAdmin from '../../../Components/Admin/Content/Rounds.Admin';
import axios from 'axios';
import serverUrl from '../../../servercon';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [ongoingRound, setOngoingRound] = React.useState("Round Two");
  const [TotalAdmins, setTotalAdmins] = React.useState(78);
  const [TotalTeams, setTotalTeams] = React.useState(50);
  const navigate = useNavigate();

  // Authentication check and data fetching
  useEffect(() => {
    checkAuthentication();
    fetchDashboardData();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Fetch teams data
      const teamsResponse = await axios.get(`${serverUrl}/api/admin/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch admins data
      const adminsResponse = await axios.get(`${serverUrl}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state with real data while keeping fallback values
      if (teamsResponse.data && teamsResponse.data.teams) {
        setTotalTeams(teamsResponse.data.teams.length);
      } else if (teamsResponse.data && Array.isArray(teamsResponse.data)) {
        setTotalTeams(teamsResponse.data.length);
      }
      if (adminsResponse.data && Array.isArray(adminsResponse.data)) {
        setTotalAdmins(adminsResponse.data.length);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/', { replace: true });
      }
      // Keep existing values as fallback
    }
  };

  const [file, setfile] = useState('dashboard');
  let content = <DashboardContentAdmin ongoingRound={ongoingRound} setOngoingRound={setOngoingRound} TotalAdmins={TotalAdmins} TotalTeams={TotalTeams} setfile={setfile} />;
  switch (file) {
    case 'dashboard':
      content = <DashboardContentAdmin ongoingRound={ongoingRound} setOngoingRound={setOngoingRound} TotalAdmins={TotalAdmins} TotalTeams={TotalTeams} setfile={setfile} />;
      break;
    case 'bidhistory':
      content = <BidHistoryAdmin />;
      break;
    case 'adminmanagement':
      content = <AdminManagementAdmin />;
      break;
    case 'teamsmanagement':
      content = <TeamsManagementAdmin />;
      break;
    case 'rounds':
      content = <RoundsAdmin ongoingRound={ongoingRound} setfile={setfile} />;
      break;
    case 'settings':
      content = <SettingsContentAdmin />;
      break;

    default:
      content = <DashboardContentAdmin ongoingRound={ongoingRound} setOngoingRound={setOngoingRound} TotalAdmins={TotalAdmins} TotalTeams={TotalTeams} setfile={setfile} />;
      break;
  }

  return (
    <Box
      bg="primary.200"
      minH="100vh"
      w="100%"
      position="relative"
      overflow="hidden"
      scrollBehavior="smooth"
    >
      <HeaderAdmin setfile={setfile} file={file} />
      <NavbarAdmin setfile={setfile} file={file} />
      <Box minH="calc(100vh - 0px)" w="100%">
        {content}
      </Box>
    </Box>
  )
}

export default AdminDashboard;

