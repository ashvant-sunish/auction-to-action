import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Button,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import serverUrl from "../../../../servercon";
import { updateRoundRealtime, pauseRoundRealtime } from "../../../../services/adminSocket";


function RoundsStartAdmin({ ongoingRound }) {
  const toast = useToast();

  // Read admin role from localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  const adminRole = adminUser?.role;
  const isSuperAdmin = adminRole === 'superadmin';

  //This Function is for Updating the round number to Real Time database
  const roundNumber = async (gameState) => {
    let roundNum = 0;
    let roundStatus = 'not_started';

    // State mapping:
    // 0 - Not yet started
    // 1 - Round 1 starts
    // 2 - Round 1 ends  
    // 3 - Round 2 starts
    // 4 - Round 2 ends
    // 5 - Round 3 starts
    // 6 - Round 3 ends

    switch (gameState) {
      case 0:
        roundNum = 0;
        roundStatus = 'not_started';
        break;
      case 1:
        roundNum = 1;
        roundStatus = 'ongoing';
        break;
      case 2:
        roundNum = 1;
        roundStatus = 'ended';
        break;
      case 3:
        roundNum = 2;
        roundStatus = 'ongoing';
        break;
      case 4:
        roundNum = 2;
        roundStatus = 'ended';
        break;
      case 5:
        roundNum = 3;
        roundStatus = 'ongoing';
        break;
      case 6:
        roundNum = 3;
        roundStatus = 'ended';
        break;
      default:
        roundNum = 0;
        roundStatus = 'not_started';
    }

    try {
      // Update round with real-time Socket.IO broadcast
      await updateRoundRealtime(roundNum, roundStatus);

      const stateNames = {
        0: 'Game Not Started',
        1: 'Round 1 Started',
        2: 'Round 1 Ended',
        3: 'Round 2 Started',
        4: 'Round 2 Ended',
        5: 'Round 3 Started',
        6: 'Round 3 Ended'
      };

      toast({
        title: "Game state updated",
        description: `${stateNames[gameState]} - broadcasted to all users`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating round:', error);
      toast({
        title: "Update failed",
        description: "Failed to broadcast round update",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStartRound = (newState) => {
    // State will update automatically via useRoundManager hook when database changes
    roundNumber(newState); // Broadcast round update via Socket.IO
  };

  const handleEndRound = (currentState) => {
    const nextState = currentState + 1;
    // State will update automatically via useRoundManager hook when database changes
    // State will update automatically via useRoundManager hook when database changes
    roundNumber(nextState);
  };

  const handlePauseResume = async (action) => {
    try {
      await pauseRoundRealtime(action);
      toast({
        title: `Round ${action === 'pause' ? 'Paused' : 'Resumed'}`,
        description: `The round has been ${action === 'pause' ? 'paused' : 'resumed'} and broadcasted to all users`,
        status: action === 'pause' ? 'warning' : 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Error ${action}ing round:`, error);
      toast({
        title: `${action === 'pause' ? 'Pause' : 'Resume'} failed`,
        description: error.response?.data?.message || `Failed to ${action} round`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Helper function to get display text for current state
  const getStateDisplay = (state) => {
    const displays = {
      0: 'Not Yet Started',
      1: 'Round 1 - Ongoing',
      2: 'Round 1 - Ended',
      3: 'Round 2 - Ongoing',
      4: 'Round 2 - Ended',
      5: 'Round 3 - Ongoing',
      6: 'Round 3 - Ended',
      7: 'Round 1 - ⏸️ Paused',
      8: 'Round 2 - ⏸️ Paused',
      9: 'Round 3 - ⏸️ Paused'
    };
    return displays[state] || 'Unknown State';
  };
  // Check if any round is paused
  const isPaused = [7, 8, 9].includes(ongoingRound);
  const alertStatus = isPaused ? 'warning' : 'info';

  return (
    <Box
      bg="white"
      p={4}
      mt={8}
      borderRadius="lg"
      width="79%"
      float="right"
      ml={2}
      mr={2}
    >
      <Alert
        status={alertStatus}
        borderRadius="md"
        justifyContent="center"
        alignItems="center"
      >
        <AlertIcon />
        <AlertTitle>{getStateDisplay(ongoingRound)}</AlertTitle>
      </Alert>
      <Flex direction="column">
        {/* ====== Round One ====== */}
        <Box borderBottom="1px" borderColor="gray.200" py={4}>
          <Flex alignItems="center">
            <Box flex="1">
              Round One
            </Box>
            <Box>
              {(ongoingRound === 0 || ongoingRound === 6) ? (
                <Button
                  onClick={() => handleStartRound(1)}
                  colorScheme="green"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  Start Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="green"
                  size="sm"
                  mr={3}
                >
                  Start Round
                </Button>
              )}
            </Box>
            <Box>
              {ongoingRound === 1 ? (
                <Button
                  onClick={() => handlePauseResume('pause')}
                  colorScheme="orange"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  ⏸ Pause
                </Button>
              ) : ongoingRound === 7 ? (
                <Button
                  onClick={() => handlePauseResume('resume')}
                  colorScheme="teal"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  ▶ Resume
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="orange"
                  size="sm"
                  mr={3}
                >
                  ⏸ Pause
                </Button>
              )}
            </Box>
            <Box>
              {(ongoingRound === 1 || ongoingRound === 7) ? (
                <Button
                  onClick={() => handleEndRound(1)}
                  colorScheme="red"
                  size="sm"
                  isDisabled={!isSuperAdmin}
                >
                  End Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              )}
            </Box>
          </Flex>
        </Box>
        {/* ====== Round Two ====== */}
        <Box borderBottom="1px" borderColor="gray.200" py={4}>
          <Flex alignItems="center">
            <Box flex="1">Round Two</Box>
            <Box>
              {ongoingRound === 2 ? (
                <Button
                  onClick={() => handleStartRound(3)}
                  colorScheme="green"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  Start Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="green"
                  size="sm"
                  mr={3}
                >
                  Start Round
                </Button>
              )}
            </Box>
            <Box>
              {ongoingRound === 3 ? (
                <Button
                  onClick={() => handlePauseResume('pause')}
                  colorScheme="orange"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  ⏸ Pause
                </Button>
              ) : ongoingRound === 8 ? (
                <Button
                  onClick={() => handlePauseResume('resume')}
                  colorScheme="teal"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  ▶ Resume
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="orange"
                  size="sm"
                  mr={3}
                >
                  ⏸ Pause
                </Button>
              )}
            </Box>
            <Box>
              {(ongoingRound === 3 || ongoingRound === 8) ? (
                <Button
                  onClick={() => handleEndRound(3)}
                  colorScheme="red"
                  size="sm"
                  isDisabled={!isSuperAdmin}
                >
                  End Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              )}
            </Box>
          </Flex>
        </Box>
        {/* ====== Round Three ====== */}
        <Box borderBottom="1px" borderColor="gray.200" py={4}>
          <Flex alignItems="center">
            <Box flex="1">Round Three</Box>
            <Box>
              {ongoingRound === 4 ? (
                <Button
                  onClick={() => handleStartRound(5)}
                  colorScheme="green"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  Start Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="green"
                  size="sm"
                  mr={3}
                >
                  Start Round
                </Button>
              )}
            </Box>
            <Box>
              {ongoingRound === 5 ? (
                <Button
                  onClick={() => handlePauseResume('pause')}
                  colorScheme="orange"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  ⏸ Pause
                </Button>
              ) : ongoingRound === 9 ? (
                <Button
                  onClick={() => handlePauseResume('resume')}
                  colorScheme="teal"
                  size="sm"
                  mr={3}
                  isDisabled={!isSuperAdmin}
                >
                  ▶ Resume
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="orange"
                  size="sm"
                  mr={3}
                >
                  ⏸ Pause
                </Button>
              )}
            </Box>
            <Box>
              {(ongoingRound === 5 || ongoingRound === 9) ? (
                <Button
                  onClick={() => handleEndRound(5)}
                  colorScheme="red"
                  size="sm"
                  isDisabled={!isSuperAdmin}
                >
                  End Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              )}
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default RoundsStartAdmin;
