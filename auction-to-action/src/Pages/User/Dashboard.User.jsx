import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  useToast,
  VStack,
  Heading,
  Text,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import serverUrl from "../../servercon";
import socketService from "../../services/socket";
import Sidebar from "../../Components/User/Sidebar.jsx";
import Navbar from "../../Components/User/Navbar.jsx";
import DashboardContent from "../../Components/User/DashboardContent.jsx";
import MyBids from "../../Components/User/MyBids.jsx";
import TradingMarket from "../../Components/User/TradingMarket.jsx";
import RoundsUser from "../../Components/User/Rounds.User.jsx";
import EnterpriseConstruction from "../../Components/User/EnterpriseConstruction.jsx";
import RulesUser from "../../Components/User/Rules.User.jsx";
import { FaLock } from "react-icons/fa";

function UserDashboard() {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [teamData, setTeamData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [gameState, setGameState] = useState(0);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetchTeamData();
    fetchCurrentRound();
    setupRealTimeConnection();

    return () => {
      socketService.disconnect();
    };
  }, [navigate]);

  // Check for first-time login after teamData is loaded
  useEffect(() => {
    if (teamData?.teamCode) {
      // Check if this specific team has seen rules before
      const teamRulesKey = `hasSeenRules_${teamData.teamCode}`;
      const hasSeenRules = localStorage.getItem(teamRulesKey);
      
      if (!hasSeenRules) {
        setIsFirstTimeLogin(true);
        setShowRules(true);
      }
    }
  }, [teamData]);

  useEffect(() => {
    if (teamData?.teamNumber) {
      socketService.joinTeam(teamData.teamNumber);
    }
  }, [teamData?.teamNumber]);

  const processRoundData = (roundData) => {
    const { roundNumber, roundStatus } = roundData;
    let newGameState = 0;
    if (roundNumber === 1) {
      newGameState = roundStatus === "ongoing" ? 1 : 2;
    } else if (roundNumber === 2) {
      newGameState = roundStatus === "ongoing" ? 3 : 4;
    } else if (roundNumber === 3) {
      newGameState = roundStatus === "ongoing" ? 5 : 6;
    }
    setGameState(newGameState);
    return newGameState;
  };

  const getRoundDisplayText = (state) => {
    const displays = {
      0: "Not Started",
      1: "Round 1 - Ongoing",
      2: "Round 1 - Ended",
      3: "Round 2 - Ongoing",
      4: "Round 2 - Ended",
      5: "Round 3 - Ongoing",
      6: "Round 3 - Ended",
    };
    return displays[state] || "Not Started";
  };

  const setupRealTimeConnection = () => {
    socketService.connect(serverUrl);

    socketService.onTeamUpdate((updatedTeam) => {
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

    socketService.onRoundUpdate((roundData) => {
      const newState = processRoundData(roundData);
      toast({
        title: "Round Update",
        description: getRoundDisplayText(newState),
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    });

    socketService.onDatabaseUpdate((data) => {
      toast({
        title: "System update",
        description: "Database has been updated",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${serverUrl}/api/team/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const response = await axios.get(`${serverUrl}/api/round/current`);
      if (response.data.success) {
        processRoundData(response.data.roundData);
      }
    } catch (error) {
      console.error("Error fetching current round:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to set isActive = false
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${serverUrl}/api/team/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Continue with logout even if backend call fails
    }

    // Clean up frontend
    if (teamData?.teamNumber) {
      socketService.leaveTeam(teamData.teamNumber);
    }
    socketService.disconnect();
    localStorage.removeItem("token");
    
    // Optional: Uncomment the next line if you want to reset rules for testing
    // localStorage.removeItem(`hasSeenRules_${teamData?.teamCode}`);
    
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    navigate("/");
  };

  const handleViewRules = () => {
    setShowRules(true);
    setIsFirstTimeLogin(false); // When manually triggered, it's not first time
  };

  const handleCloseRules = () => {
    setShowRules(false);
    // Mark that this specific team has seen the rules
    if (isFirstTimeLogin && teamData?.teamCode) {
      const teamRulesKey = `hasSeenRules_${teamData.teamCode}`;
      localStorage.setItem(teamRulesKey, "true");
      setIsFirstTimeLogin(false);
    }
  };

  const pageTitles = {
    dashboard: "Dashboard",
    "my-bids": "My History",
    "trading-market": "Trading Market",
    rounds: "Auction Rounds",
    "enterprise-construction": "Enterprise Construction",
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardContent teamData={teamData} balance={balance} gameState={gameState} />;
      case "my-bids":
        return <MyBids />;
      case "trading-market":
        return <TradingMarket />;
      case "rounds":
        return <RoundsUser gameState={gameState} />;
      case "enterprise-construction":
        return <EnterpriseConstruction gameState={gameState} />;
      default:
        return <DashboardContent teamData={teamData} balance={balance} gameState={gameState} />;
    }
  };

  return (
    <Flex h="100vh" overflow="hidden">
      {showRules && (
        <RulesUser 
          onClose={handleCloseRules}
          isFirstTime={isFirstTimeLogin}
        />
      )}
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        gameState={gameState}
      />
      <Box
        flex="1"
        ml={{ base: 0, md: isSidebarCollapsed ? "80px" : "260px" }}
        bg="gray.100"
        h="100vh"
        overflow="hidden"
        transition="margin-left 0.2s ease-in-out"
      >
        <Navbar
          pageTitle={pageTitles[activeComponent]}
          onLogout={handleLogout}
          onViewRules={handleViewRules}
          teamCode={teamData?.teamName}
          currentRound={getRoundDisplayText(gameState)}
          gameState={gameState}
        />
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
