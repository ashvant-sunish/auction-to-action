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

function AdminDashboard() {
  const [ongoingRound, setOngoingRound] = React.useState(0); // Initialize with state 0
  const [TotalAdmins, setTotalAdmins] = React.useState(78);
  const [TotalTeams, setTotalTeams] = React.useState(50);
  const navigate = useNavigate();
  const toast = useToast();

  // Authentication check and data fetching
  useEffect(() => {
    checkAuthentication();
    fetchDashboardData();
    fetchCurrentRoundState();
    setupSocketConnection();
    
    // Cleanup socket connection on unmount
    return () => {
      socketService.removeAllListeners('roundUpdated');
      socketService.removeAllListeners('teamUpdated');
      socketService.removeAllListeners('databaseUpdate');
    };
  }, []);

  const setupSocketConnection = () => {
    try {
      // Connect to WebSocket server
      socketService.connect();
      
      // Listen for round updates in real-time
      socketService.onRoundUpdate((data) => {
        console.log('🎯 Real-time round update received:', data);
        
        if (data && typeof data.roundNumber !== 'undefined' && data.roundStatus) {
          // Convert database values to our state system (0-6)
          let gameState = 0;
          
          if (data.roundNumber === 0 || !data.roundNumber || data.roundStatus === 'not_started') {
            gameState = 0; // Not yet started
          } else if (data.roundNumber === 1) {
            gameState = data.roundStatus === 'ongoing' ? 1 : 2; // Round 1 ongoing or ended
          } else if (data.roundNumber === 2) {
            gameState = data.roundStatus === 'ongoing' ? 3 : 4; // Round 2 ongoing or ended  
          } else if (data.roundNumber === 3) {
            gameState = data.roundStatus === 'ongoing' ? 5 : 6; // Round 3 ongoing or ended
          }
          
          setOngoingRound(gameState);
          
          // Only update state silently for admin dashboard
          // Toast notification is handled by the component that triggered the action
          console.log('🎯 Admin dashboard round state updated silently:', gameState);
        }
      });

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

  const fetchCurrentRoundState = async () => {
    try {
      const response = await axios.get(`${socketServerUrl}/api/round/current`);
      if (response.data.success) {
        const { roundNumber, roundStatus } = response.data.roundData;
        
        // Convert database values to our state system (0-6)
        let gameState = 0;
        
        if (roundNumber === 0 || !roundNumber || roundStatus === 'not_started') {
          gameState = 0; // Not yet started
        } else if (roundNumber === 1) {
          gameState = roundStatus === 'ongoing' ? 1 : 2; // Round 1 ongoing or ended
        } else if (roundNumber === 2) {
          gameState = roundStatus === 'ongoing' ? 3 : 4; // Round 2 ongoing or ended  
        } else if (roundNumber === 3) {
          gameState = roundStatus === 'ongoing' ? 5 : 6; // Round 3 ongoing or ended
        }
        
        setOngoingRound(gameState);
        console.log('🎯 Admin dashboard round state fetched:', gameState, { roundNumber, roundStatus });
      }
    } catch (error) {
      console.error("Error fetching current round state:", error);
      // Keep default state 0 if fetch fails
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

