import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button as ChakraButton,
  Flex,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import serverUrl from "../../servercon";

// Reusable Stat Box with mouse-following 100px spotlight frosted glass effect
const StatBox = (props) => {
  const { title, value, valueColor, subtitleText, worthValue } = props;
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Box
      position="relative"
      bg="rgba(15, 59, 61, 0.3)"
      backdropFilter="blur(5px)"
      p={5}
      borderRadius="lg"
      shadow="md"
      flex="1"
      minW={{ base: "100%", md: "300px" }}
      h="120px"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.2)"
      color="white"
      overflow="hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -200, y: -200 });
      }}
    >
      {/* 100px spotlight radius frosted glass overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.2s ease-in-out"
        background={`radial-gradient(75px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.18), transparent 100%)`}
        backdropFilter="blur(16px)"
        zIndex={1}
      />

      <VStack
        align="start"
        spacing={1}
        justifyContent="center"
        h="100%"
        position="relative"
        zIndex={2}
      >
        <Text fontSize="md" color="gray.300" fontWeight="medium">
          {title}
        </Text>
        <Text fontSize="3xl" fontWeight="bold" color={valueColor}>
          {value}
        </Text>
        <Text fontSize="md" color="gray.400">
          {subtitleText}{" "}
          {worthValue && (
            <Text as="span" fontWeight="semibold">
              {worthValue}
            </Text>
          )}
        </Text>
      </VStack>
    </Box>
  );
};

function MyBids() {
  const [selectedRound, setSelectedRound] = useState("1");
  const [bidsData, setBidsData] = useState([]);
  const [tradesData, setTradesData] = useState([]);
  const [enterprisesData, setEnterprisesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your bid history");
        setLoading(false);
        return;
      }

      const historyResponse = await fetch(`${serverUrl}/api/team/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!historyResponse.ok) {
        throw new Error("Failed to fetch transaction history");
      }

      const historyData = await historyResponse.json();
      setBidsData(historyData.bids || []);
      setTradesData(historyData.trades || []);

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
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.message || "Failed to fetch transaction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getFilteredData = () => {
    if (selectedRound === "1" || selectedRound === "2") {
      return bidsData.filter((bid) => bid.round === parseInt(selectedRound));
    } else if (selectedRound === "3") {
      return tradesData.filter((trade) => trade.round === 3);
    } else if (selectedRound === "enterprises") {
      return enterprisesData;
    } else if (selectedRound === "products") {
      return productsData;
    }
    return [];
  };

  const handleViewTrade = (trade) => {
    if (!trade) {
      console.error("Trade object is undefined");
      return;
    }
    setSelectedTrade(trade);
    onOpen();
  };

  const formatTradeItems = (items) => {
    if (!items || items.length === 0) return "No items";
    return items.map((item) => `${item.quantity} × ${item.name}`).join(", ");
  };

  const formatBidItems = (bid) => {
    if (bid.round === 2) {
      return bid.mysteryBoxReward || "Mystery Box";
    } else {
      return bid.itemName || "Unknown Item";
    }
  };

  const renderBidsTable = (data) => (
    <Table variant="simple" size="md" color="white">
      <Thead bg="#0d1117" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.08)">
            Items
          </Th>
          <Th isNumeric color="gray.300" borderColor="rgba(255, 255, 255, 0.08)">
            Amount
          </Th>
          <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.08)">
            Resources
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((bid) => (
          <Tr key={bid._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td borderColor="rgba(255, 255, 255, 0.1)">
              {formatBidItems(bid)}
            </Td>
            <Td isNumeric borderColor="rgba(255, 255, 255, 0.1)">
              ₹{bid.bidAmount.toLocaleString()}
            </Td>
            <Td borderColor="rgba(255, 255, 255, 0.1)">
              {bid.resourcesGained ? (
                <VStack align="start" spacing={1}>
                  {Object.entries(bid.resourcesGained).map(
                    ([resource, quantity]) => (
                      <Text key={resource} fontSize="sm">
                        {resource}: {quantity}
                      </Text>
                    )
                  )}
                </VStack>
              ) : (
                "No resources"
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderTradesTable = (data) => (
    <Table variant="simple" size="md" whiteSpace="nowrap" color="white">
      <Thead bg="#0d1117" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Teams
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Items Exchanged
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Money Exchanged
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Status
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Date
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((trade) => (
          <Tr key={trade._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Text fontSize="sm">
                <Text as="span" fontWeight="bold" color="#e8ff00">
                  {trade.teamOne?.teamName || "Team 1"}
                </Text>
                {" vs "}
                <Text as="span" fontWeight="bold" color="#b8d000">
                  {trade.teamTwo?.teamName || "Team 2"}
                </Text>
              </Text>
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Text fontSize="xs">
                <Text color="#e8ff00">
                  {formatTradeItems(trade.teamOneGives?.items) || "No items"}
                </Text>
                <Text color="gray.400">↔</Text>
                <Text color="#b8d000">
                  {formatTradeItems(trade.teamTwoGives?.items) || "No items"}
                </Text>
              </Text>
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Text fontSize="xs">
                <Text color="#e8ff00">
                  ₹{(trade.teamOneGives?.money || 0).toLocaleString()}
                </Text>
                <Text color="gray.400">↔</Text>
                <Text color="#b8d000">
                  ₹{(trade.teamTwoGives?.money || 0).toLocaleString()}
                </Text>
              </Text>
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Badge
                colorScheme={trade.status === "completed" ? "green" : "yellow"}
              >
                {trade.status}
              </Badge>
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              {new Date(trade.createdAt).toLocaleDateString()}
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <ChakraButton
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => handleViewTrade(trade)}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              >
                View Details
              </ChakraButton>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderEnterprisesTable = (data) => (
    <Table variant="simple" size="md" color="white">
      <Thead bg="#0d1117" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Enterprise ID
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Name
          </Th>
          <Th
            isNumeric
            color="gray.300"
            py={4}
            borderColor="rgba(255, 255, 255, 0.08)"
          >
            Worth
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Constructed Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((enterprise) => (
          <Tr key={enterprise._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td
              py={4}
              fontWeight="bold"
              color="#e8ff00"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              ENT-{enterprise.id}
            </Td>
            <Td
              py={4}
              fontWeight="medium"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              {enterprise.title}
            </Td>
            <Td
              py={4}
              isNumeric
              fontWeight="bold"
              color="#b8d000"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              ₹{Number(enterprise.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              {new Date(enterprise.constructedAt).toLocaleDateString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderProductsTable = (data) => (
    <Table variant="simple" size="md" color="white">
      <Thead bg="#0d1117" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Product ID
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Name
          </Th>
          <Th
            isNumeric
            color="gray.300"
            py={4}
            borderColor="rgba(255, 255, 255, 0.08)"
          >
            Worth
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Required Enterprise
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.08)">
            Purchased Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((product) => (
          <Tr key={product._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td
              py={4}
              fontWeight="bold"
              color="#e8ff00"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              PROD-{product.id}
            </Td>
            <Td
              py={4}
              fontWeight="medium"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              {product.title}
            </Td>
            <Td
              py={4}
              isNumeric
              fontWeight="bold"
              color="#b8d000"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              ₹{Number(product.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              ENT-{product.requiredEnterpriseId}
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              {new Date(product.purchasedAt).toLocaleDateString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const filteredData = getFilteredData();

  const ROUND_OPTIONS = [
    { value: "1", label: "Round 1 - Bids" },
    { value: "2", label: "Round 2 - Bids" },
    { value: "3", label: "Round 3 - Trades" },
    { value: "enterprises", label: "Constructed Enterprises" },
    { value: "products", label: "Purchased Products" },
  ];

  const totalEnterprisesWorth = enterprisesData
    .reduce((sum, ent) => sum + Number(ent.worth || 0), 0)
    .toLocaleString();

  const totalProductsWorth = productsData
    .reduce((sum, prod) => sum + Number(prod.worth || 0), 0)
    .toLocaleString();

  const totalPortfolioValue = (
    enterprisesData.reduce((sum, ent) => sum + Number(ent.worth || 0), 0) +
    productsData.reduce((sum, prod) => sum + Number(prod.worth || 0), 0)
  ).toLocaleString();

  return (
    <>
      <VStack spacing={6} align="stretch">
        {!loading && (
          <Flex
            wrap="nowrap"
            gap={6}
            justify="space-between"
            width="100%"
            direction={{ base: "column", md: "row" }}
          >
            <Box
              bg="rgba(13, 17, 23, 0.6)"
              p={6}
              borderRadius="0"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              borderTop="1px solid rgba(255, 255, 255, 0.05)"
              borderBottom="1px solid rgba(255, 255, 255, 0.05)"
              borderLeft="4px solid rgba(255, 255, 255, 0.1)"
              transition="all 0.3s"
              _hover={{ borderLeftColor: "#e8ff00", bg: "rgba(255,255,255,0.02)" }}
            >
              <VStack align="start" spacing={2} justifyContent="center" h="100%">
                <Text fontSize="xs" color="gray.500" letterSpacing="widest" textTransform="uppercase">
                  Total Enterprises
                </Text>
                <Text fontSize="4xl" fontWeight="300" color="white" lineHeight="1">
                  {enterprisesData.length}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Valuation:{" "}
                  <Text as="span" color="#e8ff00" fontWeight="600">
                    ₹{enterprisesData.reduce((sum, ent) => sum + Number(ent.worth || 0), 0).toLocaleString()}
                  </Text>
                </Text>
              </VStack>
            </Box>

            <Box
              bg="rgba(13, 17, 23, 0.6)"
              p={6}
              borderRadius="0"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              borderTop="1px solid rgba(255, 255, 255, 0.05)"
              borderBottom="1px solid rgba(255, 255, 255, 0.05)"
              borderLeft="4px solid rgba(255, 255, 255, 0.1)"
              transition="all 0.3s"
              _hover={{ borderLeftColor: "#e8ff00", bg: "rgba(255,255,255,0.02)" }}
            >
              <VStack align="start" spacing={2} justifyContent="center" h="100%">
                <Text fontSize="xs" color="gray.500" letterSpacing="widest" textTransform="uppercase">
                  Total Products
                </Text>
                <Text fontSize="4xl" fontWeight="300" color="white" lineHeight="1">
                  {productsData.length}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Valuation:{" "}
                  <Text as="span" color="#e8ff00" fontWeight="600">
                    ₹{productsData.reduce((sum, prod) => sum + Number(prod.worth || 0), 0).toLocaleString()}
                  </Text>
                </Text>
              </VStack>
            </Box>

            <Box
              bg="rgba(13, 17, 23, 0.6)"
              p={6}
              borderRadius="0"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              borderTop="1px solid rgba(255, 255, 255, 0.05)"
              borderBottom="1px solid rgba(255, 255, 255, 0.05)"
              borderLeft="4px solid #e8ff00"
              transition="all 0.3s"
              _hover={{ bg: "rgba(255,255,255,0.02)" }}
            >
              <VStack align="start" spacing={2} justifyContent="center" h="100%">
                <Text fontSize="xs" color="gray.500" letterSpacing="widest" textTransform="uppercase">
                  Total Portfolio Value
                </Text>
                <Text fontSize="5xl" fontWeight="300" color="#e8ff00" lineHeight="1">
                  ₹{(
                    enterprisesData.reduce((sum, ent) => sum + Number(ent.worth || 0), 0) +
                    productsData.reduce((sum, prod) => sum + Number(prod.worth || 0), 0)
                  ).toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Combined Asset Valuation
                </Text>
              </VStack>
            </Box>
          </Flex>
        )}

        <Flex justify="space-between" align="center">
          <Menu gutter={0} matchWidth={true}>
            <MenuButton
              as={ChakraButton}
              rightIcon={<FiChevronDown />}
              bg="rgba(13, 17, 23, 0.8)"
              backdropFilter="blur(10px)"
              color="white"
              border="1px solid rgba(255,255,255,0.08)"
              _hover={{ bg: "rgba(13, 17, 23, 1)" }}
              _active={{ bg: "rgba(13, 17, 23, 1)" }}
              borderRadius="lg"
              width="250px"
            >
              {ROUND_OPTIONS.find((o) => o.value === selectedRound)?.label ||
                "Select Round"}
            </MenuButton>
            <MenuList
              bg="rgba(13, 17, 23, 0.95)"
              backdropFilter="blur(15px)"
              borderColor="rgba(255,255,255,0.08)"
              color="white"
              borderRadius="lg"
              border="1px solid rgba(255,255,255,0.08)"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
              width="250px"
              minWidth="250px"
            >
              {ROUND_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  onClick={() => setSelectedRound(opt.value)}
                  bg="transparent"
                  _hover={{
                    bg: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                  _focus={{
                    bg: "rgba(255,255,255,0.1)",
                  }}
                  borderRadius="md"
                  mx={1}
                  my={0.5}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>

        {error && (
          <Alert
            status="error"
            bg="red.900"
            color="white"
            borderColor="red.700"
          >
            <AlertIcon color="white" />
            {error}
          </Alert>
        )}

        <TableContainer
          bg="transparent"
          borderTop="1px solid rgba(255, 255, 255, 0.1)"
          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
        >
          {loading ? (
            <Flex justify="center" p={12}>
              <Spinner size="xl" color="#e8ff00" />
            </Flex>
          ) : filteredData.length === 0 ? (
            <Text p={12} textAlign="center" color="gray.500" letterSpacing="widest" textTransform="uppercase">
              NO RECORDS FOUND
            </Text>
          ) : selectedRound === "3" ? (
            renderTradesTable(filteredData)
          ) : selectedRound === "enterprises" ? (
            renderEnterprisesTable(filteredData)
          ) : selectedRound === "products" ? (
            renderProductsTable(filteredData)
          ) : (
            renderBidsTable(filteredData)
          )}
        </TableContainer>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalContent
          bg="#0d1117"
          color="white"
          borderColor="rgba(255,255,255,0.08)"
        >
          <ModalHeader>Trade Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTrade && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>
                    <strong>Trade ID:</strong>
                  </Text>
                  <Badge colorScheme="blue">{selectedTrade.tradeId}</Badge>
                </HStack>
                <Divider borderColor="rgba(255,255,255,0.2)" />
                <Box>
                  <Text fontWeight="bold" color="#e8ff00">
                    Team One: {selectedTrade.teamOne?.teamName}
                  </Text>
                  <Text ml={4}>
                    <strong>Gives:</strong>{" "}
                    {formatTradeItems(selectedTrade.teamOneGives?.items)} & ₹
                    {(selectedTrade.teamOneGives?.money || 0).toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="#b8d000">
                    Team Two: {selectedTrade.teamTwo?.teamName}
                  </Text>
                  <Text ml={4}>
                    <strong>Gives:</strong>{" "}
                    {formatTradeItems(selectedTrade.teamTwoGives?.items)} & ₹
                    {(selectedTrade.teamTwoGives?.money || 0).toLocaleString()}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <ChakraButton
              onClick={onClose}
              bg="rgba(255,255,255,0.1)"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
            >
              Close
            </ChakraButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MyBids;