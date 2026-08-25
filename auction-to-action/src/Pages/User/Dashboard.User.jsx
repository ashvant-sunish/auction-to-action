import React, { useState, useEffect } from "react";
import { Box, Flex, useToast, VStack, Text, Spinner } from "@chakra-ui/react";
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
import dashboardBg from "../../assets/images/dashboardbg.jpg"; // Import the background image

function UserDashboard() {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [teamData, setTeamData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [gameState, setGameState] = useState(0);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [imageLoading, setImageLoading] = useState(true); // State for preloading
  const navigate = useNavigate();
  const toast = useToast();

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = dashboardBg;
    img.onload = () => {
      setImageLoading(false);
    };

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    setupRealTimeConnection();
    fetchTeamData();
    fetchCurrentRound();

    // Refresh team data every 30 seconds
    const refreshInterval = setInterval(fetchTeamData, 30000);

    // Send a heartbeat every 5 minutes to keep the session alive.
    // If this tab is closed, heartbeats stop and the session expires in ≤10 min.
    const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    const sendHeartbeat = async () => {
      try {
        const t = localStorage.getItem('token');
        if (t) {
          await axios.post(`${serverUrl}/api/team/heartbeat`, {}, {
            headers: { Authorization: `Bearer ${t}` }
          });
        }
      } catch (_) { /* silent — non-critical */ }
    };
    sendHeartbeat(); // immediate on mount
    const heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      socketService.disconnect();
      clearInterval(refreshInterval);
      clearInterval(heartbeatInterval);
    };
  }, [navigate]);

  useEffect(() => {
    if (teamData?.teamCode) {
      const teamRulesKey = `hasSeenRules_${teamData.teamCode}`;
      const hasSeenRules = localStorage.getItem(teamRulesKey);
      if (!hasSeenRules) {
        setIsFirstTimeLogin(true);
        setShowRules(true);
      }
    }
  }, [teamData]);

  useEffect(() => {
    if (teamData?.teamCode) {
      socketService.joinTeam(teamData.teamCode);
    }
  }, [teamData?.teamCode]);

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
      const currentTeamNumber = teamData?.teamNumber;
      if (currentTeamNumber && updatedTeam.teamNumber === currentTeamNumber) {
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
      if (JSON.stringify(response.data) !== JSON.stringify(teamData)) {
        setTeamData(response.data);
        setBalance(response.data.balance);
      }
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
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${serverUrl}/api/team/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }

    if (teamData?.teamCode) {
      socketService.leaveTeam(teamData.teamCode);
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

  const handleViewRules = () => {
    setShowRules(true);
    setIsFirstTimeLogin(false);
  };

  const handleCloseRules = () => {
    setShowRules(false);
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
        return (
          <DashboardContent
            teamData={teamData}
            balance={balance}
            gameState={gameState}
          />
        );
      case "my-bids":
        return <MyBids />;
      case "trading-market":
        return <TradingMarket />;
      case "rounds":
        return <RoundsUser gameState={gameState} />;
      case "enterprise-construction":
        return <EnterpriseConstruction gameState={gameState} />;
      default:
        return (
          <DashboardContent
            teamData={teamData}
            balance={balance}
            gameState={gameState}
          />
        );
    }
  };

  return (
    <Flex
      h="100vh"
      overflow="hidden"
      className="user-app-root"
      bg="#080b0f"
    >
      {showRules && (
        <RulesUser onClose={handleCloseRules} isFirstTime={isFirstTimeLogin} />
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
        bg="transparent"
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
        {imageLoading ? (
          <Flex h="calc(100vh - 72px)" align="center" justify="center">
            <VStack>
              <Spinner size="xl" color="white" thickness="4px" />
              <Text color="white" mt={4} fontSize="lg">
                Loading Dashboard...
              </Text>
            </VStack>
          </Flex>
        ) : (
          <Box
            p={6}
            h="calc(100vh - 72px)"
            display="flex"
            flexDirection="column"
            gap={4}
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)" },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(232, 255, 0, 0.3)",
              },
            }}
          >
            {renderContent()}
          </Box>
        )}
      </Box>
    </Flex>
  );
}

export default UserDashboard;
