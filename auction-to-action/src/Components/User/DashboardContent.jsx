import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Icon,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  Text,
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
import serverUrl from "../../servercon";
import { io } from "socket.io-client";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { PiConfettiBold } from "react-icons/pi";

const AvailableMaterialsTable = ({
  resources,
  isFullScreen,
  toggleFullScreen,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const resourcesArray = useMemo(() => {
    if (!resources || typeof resources !== "object") {
      return [];
    }
    const entries =
      resources instanceof Map
        ? Array.from(resources.entries())
        : Object.entries(resources);
    return entries
      .filter(([name, quantity]) => quantity > 0)
      .map(([name, quantity]) => ({
        name,
        count: quantity,
        totalAmount: quantity * 1000,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [resources]);

  const filteredHistory = resourcesArray.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      bg="rgba(15, 59, 61, 0.5)"
      backdropFilter="blur(10px)"
      p={6}
      borderRadius="xl"
      shadow="lg"
      h="full"
      display="flex"
      flexDirection="column"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.2)"
      color="white"
    >
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="md" fontWeight="600">
          Resources Inventory
        </Heading>
        <HStack>
          <Box
            bg="rgba(255, 255, 255, 0.1)"
            px={3}
            py={1}
            borderRadius="full"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            <Text fontSize="xs" color="white" fontWeight="semibold">
              {filteredHistory.length} Types
            </Text>
          </Box>
          <IconButton
            icon={isFullScreen ? <FiMinimize /> : <FiMaximize />}
            onClick={toggleFullScreen}
            aria-label="Toggle fullscreen"
            variant="ghost"
            size="sm"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
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
          bg="rgba(0, 0, 0, 0.2)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
          borderRadius="lg"
          _focus={{
            bg: "rgba(0, 0, 0, 0.3)",
            borderColor: "blue.300",
            boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
          }}
          _hover={{
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
        />
      </InputGroup>

      <TableContainer
        overflowY="auto"
        flex="1"
        css={{
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(255, 255, 255, 0.3)",
          },
        }}
      >
        <Table variant="simple" size="md">
          <Thead position="sticky" top={0} bg="#0f3b3d" zIndex={1}>
            <Tr>
              <Th
                color="gray.300"
                textTransform="none"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                Resource Type
              </Th>
              <Th
                isNumeric
                color="gray.300"
                textTransform="none"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                Quantity
              </Th>
              <Th
                isNumeric
                color="gray.300"
                textTransform="none"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                Approx. Value
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredHistory.map((item, index) => (
              <Tr key={index} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
                <Td borderColor="rgba(255, 255, 255, 0.1)" fontWeight="500">
                  <HStack>
                    <Box w={2} h={2} bg="blue.400" borderRadius="full" />
                    <Text>{item.name}</Text>
                  </HStack>
                </Td>
                <Td
                  isNumeric
                  borderColor="rgba(255, 255, 255, 0.1)"
                  fontWeight="500"
                >
                  {item.count}
                </Td>
                <Td isNumeric borderColor="rgba(255, 255, 255, 0.1)">
                  <Text fontWeight="600" color="green.300">
                    ₹{Math.round(item.totalAmount).toLocaleString()}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {filteredHistory.length === 0 && (
          <Box textAlign="center" py={8} color="gray.400">
            <Icon as={FaSearch} boxSize={8} mb={2} />
            <Text fontSize="sm">No resources found</Text>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

function DashboardContent({ teamData, currentRound, gameState, teamNumber }) {
  const [isMaterialsFullScreen, setMaterialsFullScreen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState("0");
  const [currentRevealedBox, setCurrentRevealedBox] = useState("0");
  const [enterpriseWorth, setEnterpriseWorth] = useState(0);
  const [productWorth, setProductWorth] = useState(0);

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (gameState === 1) {
        const response = await fetch(
          `${serverUrl}/api/admin/live-auction-status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSelectedNumber(data.selectedNumber || "0");
        }
      }

      if (gameState === 3) {
        const response = await fetch(
          `${serverUrl}/api/mysterybox/revealed-count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentRevealedBox(data.currentRevealedBox?.toString() || "0");
        }
      }

      if (gameState === 5) {
        const response = await fetch(
          `${serverUrl}/api/construction/portfolio-worth`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setEnterpriseWorth(data.enterpriseWorth || 0);
          setProductWorth(data.productWorth || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000);
    const socket = io(serverUrl);

    socket.on("bidPlaced", () => gameState === 1 && fetchLiveData());
    socket.on("mysteryBoxRevealed", () => gameState === 3 && fetchLiveData());
    socket.on(
      "enterpriseConstructed",
      () => gameState === 5 && fetchLiveData()
    );
    socket.on("productPurchased", () => gameState === 5 && fetchLiveData());

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

  const calculateTotalBalance = (credit, debit) => credit - debit;

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

  const StatCard = ({ title, value, icon, iconBgColor, valueColor }) => (
    <Box
      flex="1"
      minW="200px"
      p={4}
      shadow="md"
      borderRadius="lg"
      bg="rgba(15, 59, 61, 0.5)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      mb={4}
    >
      <Flex>
        <Box
          p={3}
          mr={4}
          bg={iconBgColor}
          borderRadius="full"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Icon as={icon} color="white" w={6} h={6} />
        </Box>
        <Box>
          <Text color="gray.300" fontSize="sm">
            {title}
          </Text>
          <Text fontWeight="bold" fontSize="2xl" color={valueColor}>
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );

  let dynamicCard;
  if (gameState === 1) {
    dynamicCard = (
      <StatCard
        title="Selected Number"
        value={selectedNumber}
        icon={FaGavel}
        iconBgColor="blue.500"
        valueColor="blue.300"
      />
    );
  } else if (gameState === 3) {
    dynamicCard = (
      <StatCard
        title="Current Revealed Box"
        value={currentRevealedBox}
        icon={PiConfettiBold}
        iconBgColor="orange.500"
        valueColor="orange.300"
      />
    );
  } else if (gameState === 5) {
    const totalWorth = enterpriseWorth + productWorth;
    dynamicCard = (
      <StatCard
        title="Total Worth"
        value={`₹${totalWorth.toLocaleString()}`}
        icon={FaRupeeSign}
        iconBgColor="purple.500"
        valueColor="purple.300"
      />
    );
  } else {
    dynamicCard = (
      <StatCard
        title="Round Status"
        value={getRoundDisplayText(currentRound)}
        icon={IoIosInformationCircleOutline}
        iconBgColor="gray.500"
        valueColor="gray.300"
      />
    );
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        overflow="hidden"
        h="full"
      >
        <Flex gap={4} flexWrap="wrap">
          <StatCard
            title="Balance"
            value={`₹${calculateTotalBalance(credit, debit).toLocaleString()}`}
            icon={MdTrendingUp}
            iconBgColor="green.500"
            valueColor="green.300"
          />
          <StatCard
            title="Debit"
            value={`₹${debit.toLocaleString()}`}
            icon={MdTrendingDown}
            iconBgColor="red.500"
            valueColor="red.300"
          />
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
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
        <ModalContent bg="transparent">
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
