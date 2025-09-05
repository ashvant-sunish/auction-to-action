import React, { useState, useEffect } from "react";
import { Box, Flex, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import serverUrl from "../../servercon";
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
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchTeamData();
  }, [navigate]);

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

  const handleLogout = () => {
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
        return <DashboardContent teamData={teamData} balance={balance} />;
      case "my-bids":
        return <MyBids />;
      case "team-bids":
        return <TeamBids />;
      case "rounds":
        return <RoundsUser />;
      default:
        return <DashboardContent teamData={teamData} balance={balance} />;
    }
  };

  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
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
