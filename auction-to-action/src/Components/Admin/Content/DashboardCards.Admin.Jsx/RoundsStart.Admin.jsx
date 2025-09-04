import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Button,
} from "@chakra-ui/react";
import React from "react";

function RoundsStartAdmin({ ongoingRound, setOngoingRound }) {
  let [ActiveRound, setActiveRound] = React.useState(null);

  const handleStartRound = (round) => {
    setOngoingRound(round);
  };
  const handleEndRound = () => {
    if (ongoingRound == "Round One") {
      setOngoingRound("Round One Ended");
    } else if (ongoingRound == "Round Two") {
      setOngoingRound("Round Two Ended");
    } else if (ongoingRound == "Round Three") {
      setOngoingRound("Round Three Ended");
      setTimeout(() => {
        setOngoingRound("Not Started");
      }, 6000);
    }
  };
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
        status="info"
        borderRadius="md"
        justifyContent="center"
        alignItems="center"
      >
        <AlertIcon />
        <AlertTitle>{ongoingRound}</AlertTitle>
      </Alert>
      <Flex direction="column">
        <Box borderBottom="1px" borderColor="gray.200" py={4}>
          <Flex>
            <Box flex="1" fontWeight="bold">
              Round One
            </Box>
            <Box>
              {ongoingRound == "Not Started" ? (
                <Button
                  onClick={() => handleStartRound("Round One")}
                  colorScheme="green"
                  size="sm"
                  mr={6}
                >
                  Start Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  onClick={() => handleStartRound("Round One")}
                  colorScheme="green"
                  size="sm"
                  mr={6}
                >
                  Start Round
                </Button>
              )}
            </Box>
            <Box>
              {ongoingRound == "Round One" ? (
                <Button
                  onClick={() => handleEndRound("Round One")}
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  onClick={() => handleEndRound("Round One")}
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              )}
            </Box>
          </Flex>
        </Box>
        <Box borderBottom="1px" borderColor="gray.200" py={4}>
          <Flex>
            <Box flex="1">Round two</Box>
            <Box>
              {ongoingRound == "Round One Ended" ? (
                <Button
                  onClick={() => handleStartRound("Round Two")}
                  colorScheme="green"
                  size="sm"
                  mr={6}
                >
                  Start Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  onClick={() => handleStartRound("Round Two")}
                  colorScheme="green"
                  size="sm"
                  mr={6}
                >
                  Start Round
                </Button>
              )}
            </Box>
            <Box>
              {ongoingRound == "Round Two" ? (
                <Button
                  onClick={() => handleEndRound("Round Two")}
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  onClick={() => handleEndRound("Round Two")}
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              )}
            </Box>
          </Flex>
        </Box>
        <Box borderBottom="1px" borderColor="gray.200" py={4}>
          <Flex>
            <Box flex="1">Round three</Box>
            <Box>
              {ongoingRound == "Round Two Ended" ? (
                <Button
                  onClick={() => handleStartRound("Round Three")}
                  colorScheme="green"
                  size="sm"
                  mr={6}
                >
                  Start Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  onClick={() => handleStartRound("Round Three")}
                  colorScheme="green"
                  size="sm"
                  mr={6}
                >
                  Start Round
                </Button>
              )}
            </Box>
            <Box>
              {ongoingRound == "Round Three" ? (
                <Button
                  onClick={() => handleEndRound("Round Three")}
                  colorScheme="red"
                  size="sm"
                >
                  End Round
                </Button>
              ) : (
                <Button
                  isDisabled
                  onClick={() => handleEndRound("Round Three")}
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
