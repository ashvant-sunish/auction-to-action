import React, { useState, useEffect } from "react";
import { Box, Flex, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import serverUrl, { socketServerUrl } from "../../servercon";
import socketService from "../../services/socket";
import Sidebar from "../../Components/User/Sidebar";
import Navbar from "../../Components/User/Navbar";
import DashboardContent from "../../Components/User/DashboardContent";
import MyBids from "../../Components/User/MyBids";
import TeamBids from "../../Components/User/TeamBids";
import RoundsUser from '../../Components/User/Rounds.User';
function UserDashboard() {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [teamData, setTeamData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [currentRound, setCurrentRound] = useState("Round 1"); // Add current round state
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchTeamData();
    fetchCurrentRound(); // Fetch initial round data
    setupRealTimeConnection();
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [navigate]);

  const setupRealTimeConnection = () => {
    // Connect to Socket.IO server using the configured URL
    console.log('🔌 Connecting to Socket.IO server:', socketServerUrl);
    socketService.connect(socketServerUrl);
    
    // Listen for team updates
    socketService.onTeamUpdate((updatedTeam) => {
      console.log('📡 Real-time team update received:', updatedTeam);
      
      // Update team data if it matches current team
      if (teamData && updatedTeam.teamNumber === teamData.teamNumber) {
        setTeamData(updatedTeam);
        setBalance(updatedTeam.balance || updatedTeam.credit || 0);
        
        toast({
          title: "Team data updated",
          description: "Your team information has been updated in real-time",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    });

    // Listen for round updates
    socketService.onRoundUpdate((roundData) => {
      console.log('📡 Round update received:', roundData);
      
      const { roundNumber, roundStatus } = roundData;
      
      // Display round information based on status
      let displayText = "Not Started";
      if (roundNumber === 0 || roundStatus === 'not_started') {
        displayText = "Not Started";
      } else if (roundStatus === 'ongoing') {
        displayText = `Round ${roundNumber} - Ongoing`;
      } else if (roundStatus === 'ended') {
        displayText = `Round ${roundNumber} - Ended`;
      } else {
        displayText = `Round ${roundNumber}`;
      }

      setCurrentRound(displayText);
      
      toast({
        title: "Round Update",
        description: `${displayText}`,
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    });

    // Listen for database updates
    socketService.onDatabaseUpdate((data) => {
      console.log('💾 Database update received:', data);
      
      toast({
        title: "System update",
        description: "Database has been updated",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    });

    // Join team room when team data is available
    if (teamData?.teamNumber) {
      socketService.joinTeam(teamData.teamNumber);
    }
  };

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${serverUrl}/api/team/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamData(response.data);
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching team data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchCurrentRound = async () => {
    try {
      const response = await axios.get(`${socketServerUrl}/api/round/current`);
      if (response.data.success) {
        const { roundNumber, roundStatus } = response.data.roundData;
        
        // Display round information based on status
        let displayText = "Not Started";
        if (roundNumber === 0 || roundStatus === 'not_started') {
          displayText = "Not Started";
        } else if (roundStatus === 'ongoing') {
          displayText = `Round ${roundNumber} - Ongoing`;
        } else if (roundStatus === 'ended') {
          displayText = `Round ${roundNumber} - Ended`;
        } else {
          displayText = `Round ${roundNumber}`;
        }
        
        setCurrentRound(displayText);
        console.log('🎯 Current round fetched:', { roundNumber, roundStatus, displayText });
      }
    } catch (error) {
      console.error("Error fetching current round:", error);
      // Keep default value if fetch fails
    }
  };

  const handleLogout = () => {
    // Disconnect socket and leave team room
    if (teamData?.teamNumber) {
      socketService.leaveTeam(teamData.teamNumber);
    }
    socketService.disconnect();
    
    localStorage.removeItem("token");
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    navigate("/");
  };

  const pageTitles = {
    dashboard: "Dashboard",
    "my-bids": "My Bidding History",
    "team-bids": "Team Bid History",
    rounds: "Rounds",
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardContent teamData={teamData} balance={balance} currentRound={currentRound} />;
      case "my-bids":
        return <MyBids />;
      case "team-bids":
        return <TeamBids />;
      case "rounds":
        return <RoundsUser />;
      default:
        return <DashboardContent teamData={teamData} balance={balance} currentRound={currentRound} />;
    }
  };

  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        currentRound={currentRound}
      />
      <Box
        flex="1"
        ml={{ base: 0, md: "260px" }}
        bg="gray.100"
        h="100vh"
        overflow="hidden"
      >
        <Navbar pageTitle={pageTitles[activeComponent]} onLogout={handleLogout} teamData={teamData} />
        <Box
          p={6}
          h="calc(100vh - 72px)"
          display="flex"
          flexDirection="column"
          gap={4}
          overflowY="auto"
        >
          {renderContent()}
        </Box>
      </Box>
    </Flex>
  );
}

export default UserDashboard;
