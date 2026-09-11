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

export const AvailableMaterialsTable = ({
  resources,
  isFullScreen,
  toggleFullScreen,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const resourcesArray = useMemo(() => {
    if (!resources || typeof resources !== "object") {
      return [];
    }
    const resourceValues = {
      "Skilled Labour": 1200,
      "Land & Workspace": 900,
      "Basic Infrastructure": 800,
      "Community Network": 600,
      "Tools & Equipment": 1500,
      "Technology Access": 2000,
      "Electricity & Energy": 1100,
      "Transportation & Logistics": 1000,
      "Training & Expertise": 1300,
      "Market Access & Partnerships": 1500,
    };
    const entries =
      resources instanceof Map
        ? Array.from(resources.entries())
        : Object.entries(resources);
    return entries
      .filter(([, quantity]) => quantity > 0)
      .map(([name, quantity]) => {
        return {
          name,
          count: quantity,
          totalAmount: quantity * (resourceValues[name] || 0),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [resources]);

  const filteredHistory = resourcesArray.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      bg="theme.surface"
      backdropFilter="blur(10px)"
      p={6}
      borderRadius="xl"
      shadow="lg"
      h="full"
      display="flex"
      flexDirection="column"
      border="1px solid"
      borderColor="theme.outline"
      color="theme.textPrimary"
    >
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="md" fontSize="22px" fontWeight="600" color="theme.textPrimary">
          Resources Inventory
        </Heading>
        <HStack>
          <Box
            bg="theme.surfaceContainer"
            px={3}
            py={1}
            borderRadius="full"
            border="1px solid"
            borderColor="theme.outline"
          >
            <Text fontSize="xs" color="theme.textSecondary" fontWeight="semibold">
              {filteredHistory.length} Types
            </Text>
          </Box>
          <IconButton
            icon={isFullScreen ? <FiMinimize /> : <FiMaximize />}
            onClick={toggleFullScreen}
            aria-label="Toggle fullscreen"
            variant="ghost"
            size="sm"
            color="theme.textSecondary"
            _hover={{ bg: "theme.surfaceContainer", color: "theme.textPrimary" }}
          />
        </HStack>
      </HStack>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color="theme.textSecondary" />
        </InputLeftElement>
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="md"
          bg="theme.background"
          border="1px solid"
          borderColor="theme.outline"
          borderRadius="lg"
          color="theme.textPrimary"
          _placeholder={{ color: "theme.textMuted" }}
          _focus={{
            bg: "theme.background",
            borderColor: "theme.primary",
            boxShadow: "0 0 0 1px var(--primary)",
          }}
          _hover={{
            borderColor: "theme.outline",
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
            background: "var(--outline)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "var(--primary)",
          },
        }}
      >
        <Table variant="simple" size="md">
          <Thead position="sticky" top={0} bg="theme.surfaceContainer" zIndex={1}>
            <Tr>
              <Th
                color="theme.textSecondary"
                fontSize="13px"
                fontWeight="600"
                textTransform="none"
                borderColor="theme.outline"
              >
                Resource Type
              </Th>
              <Th
                isNumeric
                color="#D9DEE2"
                fontSize="13px"
                fontWeight="600"
                textTransform="none"
                borderColor="theme.outline"
              >
                Quantity
              </Th>
              <Th
                isNumeric
                color="#D9DEE2"
                fontSize="13px"
                fontWeight="600"
                textTransform="none"
                borderColor="theme.outline"
              >
                Approx. Value
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredHistory.map((item, index) => (
              <Tr
                key={index}
                _hover={{
                  bg: "theme.surfaceHigh",
                  color: "theme.textPrimary",
                  shadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                  transform: "scale(1.02)",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <Td borderColor="theme.outline" fontSize="14px" fontWeight="400" color="theme.textSecondary">
                  <HStack>
                    <Box w={2} h={2} bg="theme.info" borderRadius="full" />
                    <Text>{item.name}</Text>
                  </HStack>
                </Td>
                <Td
                  isNumeric
                  borderColor="theme.outline"
                  fontSize="14px"
                  fontWeight="400"
                  color="theme.textSecondary"
                >
                  {item.count}
                </Td>
                <Td isNumeric borderColor="theme.outline" fontSize="14px" fontWeight="400">
                  <Text fontWeight="600" color="theme.success">
                    ₹{Math.round(item.totalAmount).toLocaleString()}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {filteredHistory.length === 0 && (
          <Box textAlign="center" py={8} color="theme.textMuted">
            <Icon as={FaSearch} boxSize={8} mb={2} />
            <Text fontSize="sm">No resources found</Text>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

function DashboardContent({ teamData, currentRound, gameState, teamNumber }) {
  const [enterprisesData, setEnterprisesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [isMaterialsFullScreen, setMaterialsFullScreen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState("0");
  const [currentRevealedBox, setCurrentRevealedBox] = useState("0");
  const [enterpriseWorth, setEnterpriseWorth] = useState(0);
  const [productWorth, setProductWorth] = useState(0);

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const inventoryResponse = await fetch(
        `${serverUrl}/api/construction/inventory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setEnterprisesData(inventoryData.enterprises || []);
        setProductsData(inventoryData.products || []);
      }

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

      if (gameState >= 5) {
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

    // Listen for local inventory updates dispatched from other components
    const handleInventoryUpdated = () => fetchLiveData();
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('inventoryUpdated', handleInventoryUpdated);
    }

    return () => {
      clearInterval(interval);
      socket.disconnect();
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('inventoryUpdated', handleInventoryUpdated);
      }
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
      bg="theme.surface"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="theme.outline"
      mb={4}
      _hover={{
        bg: "theme.surfaceHigh",
        transform: "translateY(-4px) scale(1.01)",
        transition: "all 0.3s ease-in-out",
        shadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
        borderColor: "theme.outline",
      }}
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
          <Text color="theme.textSecondary" fontSize="15px" fontWeight="500">
            {title}
          </Text>
          <Text fontWeight="600" fontSize="26px" color={valueColor}>
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );

  const InfoCard = ({ title, value, valueColor, secondaryValue }) => (
    <Box
      flex="1"
      minW="200px"
      p={4}
      shadow="md"
      borderRadius="lg"
      bg="theme.surface"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="theme.outline"
      mb={4}
      _hover={{
        bg: "theme.surfaceHigh",
        transform: "translateY(-4px) scale(1.01)",
        transition: "all 0.3s ease-in-out",
        shadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
        borderColor: "theme.outline",
      }}
    >
      <Flex>
        <Box>
          <Text color="theme.textSecondary" fontSize="15px" fontWeight="500">
            {title}
          </Text>
          <Text fontWeight="600" fontSize="26px" color={valueColor} paddingLeft={3}>
            {value}
          </Text>
          <Text as="span" fontWeight="400" color="theme.textMuted" fontSize="13px">
            {secondaryValue}
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
        iconBgColor="theme.info"
        valueColor="theme.info"
      />
    );
  } else if (gameState === 3) {
    dynamicCard = (
      <StatCard
        title="Current Revealed Box"
        value={currentRevealedBox}
        icon={PiConfettiBold}
        iconBgColor="theme.warning"
        valueColor="theme.warning"
      />
    );
  } else if (gameState === 5) {
    const totalWorth = enterpriseWorth + productWorth;
    dynamicCard = (
      <StatCard
        title="Total Worth"
        value={`₹${totalWorth.toLocaleString()}`}
        icon={FaRupeeSign}
        iconBgColor="theme.portfolio"
        valueColor="theme.portfolio"
      />
    );
  } else {
    dynamicCard = (
      <StatCard
        title="Round Status"
        value={getRoundDisplayText(currentRound)}
        icon={IoIosInformationCircleOutline}
        iconBgColor="theme.surfaceHigh"
        valueColor="theme.textSecondary"
      />
    );
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        overflow="hidden"
        h="full"
        wrap="wrap"
      >
        <Flex gap={4} flexWrap="wrap">
          <StatCard
            title="Balance"
            value={`₹${calculateTotalBalance(credit, debit).toLocaleString()}`}
            icon={MdTrendingUp}
            iconBgColor="theme.success"
            valueColor="theme.success"
          />
          <StatCard
            title="Debit"
            value={`₹${debit.toLocaleString()}`}
            icon={MdTrendingDown}
            iconBgColor="theme.error"
            valueColor="theme.error"
          />
          {dynamicCard}
        </Flex>
        <Flex gap={4} flexWrap="wrap">
          <InfoCard
            title={"Total Enterprises"}
            value={enterprisesData.length}
            valueColor={"theme.info"}
            secondaryValue={`Worth: ₹${enterprisesData
              .reduce((sum, prod) => sum + Number(prod.worth || 0), 0)
              .toLocaleString()}`}
          />
          <InfoCard
            title={"Total Products"}
            value={productsData.length}
            valueColor={"theme.warning"}
            secondaryValue={`Worth: ₹${productsData
              .reduce((sum, prod) => sum + Number(prod.worth || 0), 0)
              .toLocaleString()}`}
          />
          <InfoCard
            title={"Total Portfolio Value"}
            value={`₹${(enterpriseWorth + productWorth).toLocaleString()}`}
            valueColor={"theme.portfolio"}
            secondaryValue={"Enterprises + Products"}
          />
        </Flex>
        <Box height={"3"}></Box>
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
