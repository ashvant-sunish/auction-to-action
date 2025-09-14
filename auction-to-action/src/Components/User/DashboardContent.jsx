import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Icon,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
} from "@chakra-ui/react";
import { MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { FaGavel, FaRupeeSign } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FiMaximize, FiMinimize } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import serverUrl from "../../servercon";
import Round2 from "./../Admin/Content/Rounds/Round2.jsx";
import { RiAuctionLine } from "react-icons/ri";
import { IoIosInformationCircleOutline } from "react-icons/io";

const AvailableMaterialsTable = ({
  resources,
  isFullScreen,
  toggleFullScreen,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const resourcesArray = useMemo(() => {
    // Convert resources object/Map to array format
    if (!resources || typeof resources !== "object") {
      return [];
    }

    // Handle both Map and plain object
    const entries =
      resources instanceof Map
        ? Array.from(resources.entries())
        : Object.entries(resources);

    return entries
      .filter(([name, quantity]) => quantity > 0) // Only show resources with quantity > 0
      .map(([name, quantity]) => ({
        name,
        count: quantity,
        totalAmount: quantity * 1000, // Estimated value per unit
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [resources]);

  const filteredHistory = resourcesArray.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="xl"
      shadow="lg"
      h="full"
      display="flex"
      flexDirection="column"
      border="1px solid"
      borderColor="gray.100"
    >
      <HStack justify="space-between" align="center" mb={4}>
        <HStack>
          <Heading size="md" color="gray.700" fontWeight="600">
            Resources Inventory
          </Heading>
        </HStack>
        <HStack>
          <Box
            bg="blue.50"
            px={3}
            py={1}
            borderRadius="full"
            border="1px solid"
            borderColor="blue.200"
          >
            <Text fontSize="xs" color="blue.600" fontWeight="semibold">
              {filteredHistory.length} Types
            </Text>
          </Box>
          <IconButton
            icon={isFullScreen ? <FiMinimize /> : <FiMaximize />}
            onClick={toggleFullScreen}
            aria-label="Toggle fullscreen"
            variant="ghost"
            size="sm"
          />
        </HStack>
      </HStack>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="md"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          _focus={{
            bg: "white",
            borderColor: "blue.300",
            boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
          }}
          _hover={{
            borderColor: "gray.300",
          }}
        />
      </InputGroup>

      <TableContainer
        overflowY="auto"
        flex="1"
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#a8a8a8",
          },
        }}
      >
        <Table variant="simple" size="md">
          <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
            <Tr>
              <Th
                color="gray.600"
                fontWeight="600"
                fontSize="sm"
                textTransform="none"
                borderColor="gray.200"
                py={4}
              >
                Resource Type
              </Th>
              <Th
                isNumeric
                color="gray.600"
                fontWeight="600"
                fontSize="sm"
                textTransform="none"
                borderColor="gray.200"
                py={4}
              >
                Quantity
              </Th>
              <Th
                isNumeric
                color="gray.600"
                fontWeight="600"
                fontSize="sm"
                textTransform="none"
                borderColor="gray.200"
                py={4}
              >
                Approx. Value
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredHistory.map((item, index) => (
              <Tr
                key={index}
                _hover={{ bg: "blue.50" }}
                transition="background-color 0.2s"
              >
                <Td
                  borderColor="gray.100"
                  py={4}
                  fontWeight="500"
                  color="gray.700"
                >
                  <HStack>
                    <Box w={2} h={2} bg="blue.400" borderRadius="full" />
                    <Text>{item.name}</Text>
                  </HStack>
                </Td>
                <Td
                  isNumeric
                  borderColor="gray.100"
                  py={4}
                  fontWeight="500"
                  color="gray.700"
                >
                  {item.count}
                </Td>
                <Td isNumeric borderColor="gray.100" py={4}>
                  <Text fontWeight="600" color="green.600">
                    ₹{Math.round(item.totalAmount).toLocaleString()}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {filteredHistory.length === 0 && (
          <Box textAlign="center" py={8} color="gray.500">
            <Icon as={FaSearch} boxSize={8} mb={2} />
            <Text fontSize="sm">No resources found</Text>
            <Text fontSize="xs" color="gray.400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No resources in inventory yet"}
            </Text>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

function DashboardContent({ teamData, currentRound, gameState }) {
  const [isMaterialsFullScreen, setMaterialsFullScreen] = useState(false);

  // Sample data for the live auction card
  const sampleLiveAuction = {
    bidCount: 42,
    itemName: "Rare Metal",
  };

  const toggleMaterialsFullScreen = () =>
    setMaterialsFullScreen(!isMaterialsFullScreen);

  const credit = teamData?.credit ?? 0;
  const debit = teamData?.debit ?? 0;
  const resources = teamData?.resources ?? {};

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

  let dynamicCard;

  if (gameState === 1 || gameState === 3) {
    // Live Bids card for ongoing Round 1 and Round 2
    dynamicCard = (
      <Box
        flex="1" // Added flex="1" to make it take up available space
        minW="200px" // Added minW to maintain responsiveness
        p={4}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        mb={4}
      >
        <Flex>
          <Box
            pl={4}
            pr={4}
            mr={4}
            bg="blue.100"
            borderRadius="full"
            justifyContent={"center"}
            alignItems="center"
            display="flex"
          >
            <Icon as={FaGavel} color="blue.500" w={8} h={10} />
          </Box>
          <Box>
            <Text color="gray.500" fontSize="sm">
              Live Bids
            </Text>
            <Text fontWeight="bold" fontSize="2xl">
              {sampleLiveAuction.bidCount}
            </Text>
            <Text color="gray.600" fontSize="sm">
              for {sampleLiveAuction.itemName}
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  } else if (gameState === 5) {
    // Enterprise Amount card for ongoing Round 3
    dynamicCard = (
      <Box
        flex="1"
        minW="200px"
        p={4}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        mb={4}
      >
        <Flex>
          <Box
            pl={4}
            pr={4}
            mr={4}
            bg="purple.100"
            borderRadius="full"
            justifyContent={"center"}
            alignItems="center"
            display="flex"
          >
            <Icon as={FaRupeeSign} color="purple.500" w={8} h={10} />
          </Box>
          <Box>
            <Text color="gray.500" fontSize="sm">
              Enterprise Amount
            </Text>
            <Text fontWeight="bold" fontSize="2xl">
              ₹12,50,000
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  } else {
    // Default card for all other states
    dynamicCard = (
      <Box
        flex="1"
        minW="200px"
        p={4}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        mb={4}
      >
        <Flex>
          <Box
            pl={4}
            pr={4}
            mr={4}
            bg="gray.100"
            borderRadius="full"
            justifyContent={"center"}
            alignItems="center"
            display="flex"
          >
            <Icon
              as={IoIosInformationCircleOutline}
              color="gray.500"
              w={8}
              h={10}
            />
          </Box>
          <Box>
            <Text color="gray.500" fontSize="sm">
              Round Status
            </Text>
            <Text fontWeight="bold" fontSize="2xl">
              {getRoundDisplayText(currentRound)}
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <>
      <Box
        p={6}
        h="calc(100vh - 72px)"
        display="flex"
        flexDirection="column"
        gap={4}
        overflow="hidden"
      >
        <Flex gap={4} flexWrap="wrap">
          <Box flex="1" minW="200px">
            <Box
              p={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg="white"
              mb={4}
            >
              <Flex>
                <Box
                  pl={4}
                  pr={4}
                  mr={4}
                  bg="green.100"
                  borderRadius="full"
                  justifyContent={"center"}
                  alignItems="center"
                  display="flex"
                >
                  <Icon as={MdTrendingUp} color="green.500" w={8} h={10} />
                </Box>
                <Box>
                  <Text color="gray.500" fontSize="sm">
                    Credit
                  </Text>
                  <Text fontWeight="bold" fontSize="2xl">
                    ₹{credit.toLocaleString()}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
          <Box flex="1" minW="200px">
            <Box
              p={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg="white"
              mb={4}
            >
              <Flex>
                <Box
                  pl={4}
                  pr={4}
                  mr={4}
                  bg="red.100"
                  borderRadius="full"
                  justifyContent={"center"}
                  alignItems="center"
                  display="flex"
                >
                  <Icon as={MdTrendingDown} color="red.500" w={8} h={10} />
                </Box>
                <Box>
                  <Text color="gray.500" fontSize="sm">
                    Debit
                  </Text>
                  <Text fontWeight="bold" fontSize="2xl">
                    ₹{debit.toLocaleString()}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
          {dynamicCard}
        </Flex>
        <Box w="100%" flex="1" minH="0">
          <AvailableMaterialsTable
            resources={resources}
            isFullScreen={isMaterialsFullScreen}
            toggleFullScreen={toggleMaterialsFullScreen}
          />
        </Box>
      </Box>

      <Modal
        isOpen={isMaterialsFullScreen}
        onClose={toggleMaterialsFullScreen}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={6} h="100vh" display="flex" flexDirection="column">
            <AvailableMaterialsTable
              resources={resources}
              isFullScreen={isMaterialsFullScreen}
              toggleFullScreen={toggleMaterialsFullScreen}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DashboardContent;