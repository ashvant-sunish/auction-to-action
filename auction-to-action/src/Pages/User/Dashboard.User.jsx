import React, { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../../Components/User/Sidebar";
import Navbar from "../../Components/User/Navbar";
import DashboardContent from "../../Components/User/DashboardContent";
import MyBids from "../../Components/User/MyBids";
import TeamBids from "../../Components/User/TeamBids";
import RoundsUser from '../../Components/User/Rounds.User';
function UserDashboard() {
  const [activeComponent, setActiveComponent] = useState("dashboard");

  const pageTitles = {
    dashboard: "Dashboard",
    "my-bids": "My Bidding History",
    "team-bids": "Team Bid History",
    rounds: "Rounds",
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardContent />;
      case "my-bids":
        return <MyBids />;
      case "team-bids":
        return <TeamBids />;
      case "rounds":
        return <RoundsUser />;
      default:
        return <DashboardContent />;
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
        <Navbar pageTitle={pageTitles[activeComponent]} />
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
