import { Box, Tab, TabList, Tabs, Toast } from "@chakra-ui/react";
import React, { useState } from "react";
import Round2 from "./Rounds/Round2.jsx";
import Round3 from "./Rounds/Round3";
import Round1 from "./Rounds/Round1";

function RoundsAdmin({ ongoingRound, setfile }) {

  // Styles for the tabs to ensure they are visible on a dark background
  const tabStyles = {
    color: "white",
    _selected: { color: "teal.800", bg: "gray.100", fontWeight: "bold" },
    _disabled: { color: "white", opacity: 0.5, cursor: "not-allowed" },
  };

  const renderTabContent = () => {
    switch (ongoingRound) {
      case 0:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Not Yet Started</p>
          </Box>
        );
      case 1:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <Round1/>
          </Box>
        );
      case 3:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            {/* <p>Round two!</p> */}
            <Round2/>
          </Box>
        );
      case 5:
        // The Round3 component now provides its own background
        return (
          <Box mt={4}>
            <Round3 />
          </Box>
        );
      case 2:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Round one ended!</p>
          </Box>
        );
      case 4:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <p>Round two ended!</p>
          </Box>
        );
      case 6:
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
            ongoingRound === 0
              ? 4
              : ongoingRound === 1
              ? 0
              : ongoingRound === 2
              ? 4
              : ongoingRound === 3
              ? 1
              : ongoingRound === 4
              ? 4
              : ongoingRound === 5
              ? 2
              : ongoingRound === 6
              ? 4
              : null
          }
        >
          <TabList>
            {ongoingRound === 0 ? (
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
            ) : ongoingRound === 1 ? (
              <>
                <Tab {...tabStyles}>Round 1</Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : ongoingRound === 3 ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles}>Round 2</Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 3
                </Tab>
              </>
            ) : ongoingRound === 5 ? (
              <>
                <Tab {...tabStyles} isDisabled>
                  Round 1
                </Tab>
                <Tab {...tabStyles} isDisabled>
                  Round 2
                </Tab>
                <Tab {...tabStyles}>Round 3</Tab>
              </>
            ) : ongoingRound === 2 ? (
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
            ) : ongoingRound === 4 ? (
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
            ) : ongoingRound === 6 ? (
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
