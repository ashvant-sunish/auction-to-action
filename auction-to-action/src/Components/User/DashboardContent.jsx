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
import { io } from 'socket.io-client';
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
  const [selectedNumber, setSelectedNumber] = useState("0");
  const [currentRevealedBox, setCurrentRevealedBox] = useState("0");
  const [enterpriseWorth, setEnterpriseWorth] = useState(0);
  const [productWorth, setProductWorth] = useState(0);

  // Sample data for the live auction card
  const sampleLiveAuction = {
    bidCount: 42,
    itemName: "Rare Metal",
  };

  // Fetch live data based on current round
  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for live data fetch');
        return;
      }

      console.log('Fetching live data for gameState:', gameState);

      // Fetch live selected number for Round 1
      if (gameState === 1) {
        console.log('Fetching Round 1 selected number...');
        const response = await fetch(`${serverUrl}/api/admin/live-auction-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Selected number response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Selected number data:', data);
          setSelectedNumber(data.selectedNumber || "0");
        } else {
          console.error('Selected number fetch failed:', await response.text());
        }
      }

      // Fetch current revealed mystery box number for Round 2
      if (gameState === 3) {
        console.log('Fetching Round 2 current revealed box number...');
        const response = await fetch(`${serverUrl}/api/mysterybox/revealed-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Mystery box response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Mystery box data:', data);
          setCurrentRevealedBox(data.currentRevealedBox?.toString() || "0");
        } else {
          console.error('Mystery box fetch failed:', await response.text());
        }
      }

      // Fetch enterprise and product worth for Round 3
      if (gameState === 5) {
        console.log('Fetching Round 3 portfolio worth...');
        const response = await fetch(`${serverUrl}/api/construction/portfolio-worth`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Portfolio worth response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Portfolio worth data:', data);
          setEnterpriseWorth(data.enterpriseWorth || 0);
          setProductWorth(data.productWorth || 0);
        } else {
          console.error('Portfolio worth fetch failed:', await response.text());
        }
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  useEffect(() => {
    fetchLiveData();
    // Refresh data every 10 seconds for live updates
    const interval = setInterval(fetchLiveData, 10000);

    // Socket connection for real-time updates
    const socket = io(serverUrl);

    // Listen for bid placed events (Round 1)
    socket.on('bidPlaced', () => {
      if (gameState === 1) {
        fetchLiveData();
      }
    });

    // Listen for mystery box revealed events (Round 2)
    socket.on('mysteryBoxRevealed', () => {
      if (gameState === 3) {
        fetchLiveData();
      }
    });

    // Listen for construction events (Round 3)
    socket.on('enterpriseConstructed', () => {
      if (gameState === 5) {
        fetchLiveData();
      }
    });

    socket.on('productPurchased', () => {
      if (gameState === 5) {
        fetchLiveData();
      }
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [gameState]);

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

  if (gameState === 1) {
    // Live Bids card for Round 1
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
              Selected Number
            </Text>
            <Flex gap={2}>
              <Text fontWeight="bold" fontSize="2xl" color="blue.600">
                {selectedNumber}
              </Text>
              <Text color="gray.600" fontSize="xs" alignSelf="center" ml={2} mt={2}>
                Current Selection
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>
    );
  } else if (gameState === 3) {
    // Mystery Box card for Round 2
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
            bg="orange.100"
            borderRadius="full"
            justifyContent={"center"}
            alignItems="center"
            display="flex"
          >
            <Icon as={RiAuctionLine} color="orange.500" w={8} h={10} />
          </Box>
          <Box>
            <Text color="gray.500" fontSize="sm">
              Current Revealed Box
            </Text>
            <Flex>
              <Text fontWeight="bold" fontSize="4xl" color="orange.600">
                {currentRevealedBox}
              </Text>
              <Text color="gray.600" fontSize="xs" alignSelf="center" ml={2} mt={2}>
                Latest Box Number
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>
    );
  } else if (gameState === 5) {
    // Portfolio Worth card for Round 3
    const totalWorth = enterpriseWorth + productWorth;
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
              Total Worth
            </Text>
            <Flex>
              <Text fontWeight="bold" fontSize="2xl">
                ₹{totalWorth.toLocaleString()}
              </Text>
              <Text color="gray.600" fontSize="xs" alignSelf="center" ml={2} mt={2}>
                Enterprises + Products
              </Text>
            </Flex>
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