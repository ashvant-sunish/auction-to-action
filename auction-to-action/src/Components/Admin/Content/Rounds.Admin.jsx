import { Box, Tab, TabList, Tabs } from "@chakra-ui/react";
import React, { useState } from "react";
import Round3 from "./Rounds/Round3";

function RoundsAdmin({ ongoingRound, setfile }) {
  const [activeRound, setActiveRound] = useState(ongoingRound);
  if (setActiveRound == "Round 1") {
    console.error("Please Start the round from dashboard");
  }

  // Styles for the tabs to ensure they are visible on a dark background
  const tabStyles = {
    color: "white",
    _selected: { color: "teal.800", bg: "gray.100", fontWeight: "bold" },
    _disabled: { color: "white", opacity: 0.5, cursor: "not-allowed" },
  };

  const renderTabContent = () => {
    switch (activeRound) {
      case "Not Started":
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Not Yet Started</p>
          </Box>
        );
      case "Round One":
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Round one!</p>
          </Box>
        );
      case "Round Two":
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Round two!</p>
          </Box>
        );
      case "Round Three":
        // The Round3 component now provides its own background
        return (
          <Box mt={4}>
            <Round3 />
          </Box>
        );
      case "Round One Ended":
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Round one ended!</p>
          </Box>
        );
      case "Round Two Ended":
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Round two ended!</p>
          </Box>
        );
      case "Round Three Ended":
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Round three ended!</p>
          </Box>
        );
      default:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Not Yet Started</p>
          </Box>
        );
    }
  };

  return (
    <Box>
      {/* Removed the white background from this Box to allow page background to show */}
      <Box p={4} mt={2} borderRadius="md" width="80%" float="right">
        <Tabs
          variant="soft-rounded"
          index={
            activeRound === "Not Started"
              ? 4
              : activeRound === "Round One"
              ? 0
              : activeRound === "Round One Ended"
              ? 4
              : activeRound === "Round Two"
              ? 1
              : activeRound === "Round Two Ended"
              ? 4
              : activeRound === "Round Three"
              ? 2
              : activeRound === "Round Three Ended"
              ? 4
              : null
          }
        >
          <TabList>
            {activeRound === "Not Started" ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : activeRound === "Round One" ? (
              <>
                <Tab {...tabStyles}>Round 1</Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : activeRound === "Round Two" ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles}>Round 2</Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : activeRound === "Round Three" ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles}>Round 3</Tab>
              </>
            ) : activeRound === "Round One Ended" ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : activeRound === "Round Two Ended" ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : activeRound === "Round Three Ended" ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : null}
            <Tab hidden>Reset</Tab>
          </TabList>
        </Tabs>
        {renderTabContent()}
      </Box>
    </Box>
  );
}

export default RoundsAdmin;
