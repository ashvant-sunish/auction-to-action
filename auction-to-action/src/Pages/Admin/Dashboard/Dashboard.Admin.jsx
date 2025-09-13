import React, { useState, useEffect } from 'react'
import HeaderAdmin from '../../../Components/Admin/Header/Header.Admin';
import NavbarAdmin from '../../../Components/Admin/Navbar/Navbar.Admin';
import { Box, useToast } from '@chakra-ui/react';
import DashboardContentAdmin from '../../../Components/Admin/Content/DashboardContent.Admin';
import AdminManagementAdmin from '../../../Components/Admin/Content/AdminManagement.Admin';
import TeamsManagementAdmin from '../../../Components/Admin/Content/TeamsManagement.Admin';
import BidHistoryAdmin from '../../../Components/Admin/Content/BidHistory.Admin';
import RoundsAdmin from '../../../Components/Admin/Content/Rounds.Admin';
import axios from 'axios';
import serverUrl, { socketServerUrl } from '../../../servercon';
import { useNavigate } from 'react-router-dom';
import socketService from '../../../services/socket';
import { useRoundManager } from '../../../hooks/useRoundManager';

function AdminDashboard() {
  const [TotalAdmins, setTotalAdmins] = React.useState(78);
  const [TotalTeams, setTotalTeams] = React.useState(50);
  const navigate = useNavigate();
  const toast = useToast();
  
  // Use the round manager hook for real-time database connectivity
  const { currentRound, gameState, isConnected, error } = useRoundManager();
  const ongoingRound = gameState; // Use gameState from hook

  // Authentication check and data fetching
  useEffect(() => {
    checkAuthentication();
    fetchDashboardData();
    setupSocketConnection();
    
    // Show connection status
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
    
    // Cleanup socket connection on unmount
    return () => {
      socketService.removeAllListeners('roundUpdated');
      socketService.removeAllListeners('teamUpdated');
      socketService.removeAllListeners('databaseUpdate');
    };
  }, [error]); // Add error to dependency array

  const setupSocketConnection = () => {
    try {
      // Connect to WebSocket server
      socketService.connect();
      
      // Note: Round updates are handled by useRoundManager hook
      // This avoids duplicate listeners and ensures database sync
      
      // Listen for team updates (for refreshing team count)
      socketService.onTeamUpdate((data) => {
        console.log('👥 Real-time team update received:', data);
        // Refresh dashboard data when teams are updated
        fetchDashboardData();
      });

      // Listen for general database updates
      socketService.onDatabaseUpdate((data) => {
        console.log('💾 Real-time database update received:', data);
        if (data.type === 'team' || data.type === 'admin') {
          fetchDashboardData();
        }
      });

      console.log('✅ Socket connections established for admin dashboard');
    } catch (error) {
      console.error('❌ Error setting up socket connection:', error);
    }
  };

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
      if (teamsResponse.data && Array.isArray(teamsResponse.data)) {
        setTotalTeams(teamsResponse.data.length);
      }
      
      // Update admin count with real data
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
  let content = <DashboardContentAdmin ongoingRound={ongoingRound} TotalAdmins={TotalAdmins} TotalTeams={TotalTeams} setfile={setfile} />;
  switch (file) {
    case 'dashboard':
      content = <DashboardContentAdmin ongoingRound={ongoingRound} TotalAdmins={TotalAdmins} TotalTeams={TotalTeams} setfile={setfile} />;
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

    default:
      content = <DashboardContentAdmin ongoingRound={ongoingRound} TotalAdmins={TotalAdmins} TotalTeams={TotalTeams} setfile={setfile} />;
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

