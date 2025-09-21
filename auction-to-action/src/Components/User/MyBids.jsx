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
      return tradesData;
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
    <Table variant="simple" size="md">
      <Thead bg="gray.50">
        <Tr>
          <Th>Items</Th>
          <Th isNumeric>Amount</Th>
          <Th>Resources</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((bid) => (
          <Tr key={bid._id}>
            <Td>{formatBidItems(bid)}</Td>
            <Td isNumeric>₹{bid.bidAmount.toLocaleString()}</Td>
            <Td>
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
    <Table variant="simple" size="md" whiteSpace="nowrap">
      <Thead bg="gray.50">
        <Tr>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Teams
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Items Exchanged
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Money Exchanged
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Status
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Date
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((trade, index) => (
          <Tr
            key={trade._id}
            bg={index % 2 === 0 ? "white" : "gray.25"}
            _hover={{ bg: "gray.50" }}
          >
            <Td py={4}>
              <Text fontSize="sm">
                <Text as="span" fontWeight="bold" color="blue.600">
                  {trade.teamOne?.teamName || "Team 1"}
                </Text>
                {" vs "}
                <Text as="span" fontWeight="bold" color="green.600">
                  {trade.teamTwo?.teamName || "Team 2"}
                </Text>
              </Text>
            </Td>
            <Td py={4}>
              <Text fontSize="xs">
                <Text color="blue.600">
                  {formatTradeItems(trade.teamOneGives?.items) || "No items"}
                </Text>
                <Text color="gray.500">↔</Text>
                <Text color="green.600">
                  {formatTradeItems(trade.teamTwoGives?.items) || "No items"}
                </Text>
              </Text>
            </Td>
            <Td py={4}>
              <Text fontSize="xs">
                <Text color="blue.600">
                  ₹{(trade.teamOneGives?.money || 0).toLocaleString()}
                </Text>
                <Text color="gray.500">↔</Text>
                <Text color="green.600">
                  ₹{(trade.teamTwoGives?.money || 0).toLocaleString()}
                </Text>
              </Text>
            </Td>
            <Td py={4}>
              <Badge
                colorScheme={
                  trade.status === "completed"
                    ? "green"
                    : trade.status === "pending"
                    ? "yellow"
                    : "red"
                }
                px={3}
                py={1}
                borderRadius="full"
              >
                {trade.status}
              </Badge>
            </Td>
            <Td py={4} color="gray.600">
              {new Date(trade.createdAt).toLocaleDateString()}
            </Td>
            <Td py={4}>
              <ChakraButton
                size="sm"
                colorScheme="blue"
                variant="outline"
                borderRadius="lg"
                onClick={() => handleViewTrade(trade)}
                _hover={{ bg: "blue.50" }}
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
    <Table variant="simple" size="md">
      <Thead bg="gray.50">
        <Tr>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Enterprise ID
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Name
          </Th>
          <Th
            fontSize="sm"
            fontWeight="semibold"
            color="gray.700"
            py={4}
            isNumeric
          >
            Worth
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Constructed Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((enterprise, index) => (
          <Tr
            key={enterprise._id}
            bg={index % 2 === 0 ? "white" : "gray.25"}
            _hover={{ bg: "gray.50" }}
          >
            <Td py={4} fontWeight="bold" color="blue.600">
              ENT-{enterprise.id}
            </Td>
            <Td py={4} fontWeight="medium">
              {enterprise.title}
            </Td>
            <Td py={4} isNumeric fontWeight="bold" color="green.600">
              ₹{Number(enterprise.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.600">
              {new Date(enterprise.constructedAt).toLocaleDateString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderProductsTable = (data) => (
    <Table variant="simple" size="md">
      <Thead bg="gray.50">
        <Tr>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Product ID
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Name
          </Th>
          <Th
            fontSize="sm"
            fontWeight="semibold"
            color="gray.700"
            py={4}
            isNumeric
          >
            Worth
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Required Enterprise
          </Th>
          <Th fontSize="sm" fontWeight="semibold" color="gray.700" py={4}>
            Purchased Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((product, index) => (
          <Tr
            key={product._id}
            bg={index % 2 === 0 ? "white" : "gray.25"}
            _hover={{ bg: "gray.50" }}
          >
            <Td py={4} fontWeight="bold" color="blue.600">
              PROD-{product.id}
            </Td>
            <Td py={4} fontWeight="medium">
              {product.title}
            </Td>
            <Td py={4} isNumeric fontWeight="bold" color="green.600">
              ₹{Number(product.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.600">
              ENT-{product.requiredEnterpriseId}
            </Td>
            <Td py={4} color="gray.600">
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

  return (
    <>
      <VStack p={6} spacing={6} align="stretch">
        {/* Summary Cards */}
        {!loading && (
          <Flex
            wrap="nowrap"
            gap={6}
            justify="space-between"
            width="100%"
            direction={{ base: "column", md: "row" }}
          >
            <Box
              bg="white"
              p={5}
              borderRadius="lg"
              shadow="sm"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              h="120px"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <VStack
                align="start"
                spacing={1}
                justifyContent="center"
                h="100%"
              >
                <Text fontSize="md" color="gray.500" fontWeight="medium">
                  Total Enterprises
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {enterprisesData.length}
                </Text>
                <Text fontSize="md" color="gray.600">
                  Worth:{" "}
                  <Text as="span" fontWeight="semibold">
                    ₹
                    {enterprisesData
                      .reduce((sum, ent) => sum + Number(ent.worth || 0), 0)
                      .toLocaleString()}
                  </Text>
                </Text>
              </VStack>
            </Box>

            <Box
              bg="white"
              p={5}
              borderRadius="lg"
              shadow="sm"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              h="120px"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <VStack
                align="start"
                spacing={1}
                justifyContent="center"
                h="100%"
              >
                <Text fontSize="md" color="gray.500" fontWeight="medium">
                  Total Products
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  {productsData.length}
                </Text>
                <Text fontSize="md" color="gray.600">
                  Worth:{" "}
                  <Text as="span" fontWeight="semibold">
                    ₹
                    {productsData
                      .reduce((sum, prod) => sum + Number(prod.worth || 0), 0)
                      .toLocaleString()}
                  </Text>
                </Text>
              </VStack>
            </Box>

            <Box
              bg="white"
              p={5}
              borderRadius="lg"
              shadow="sm"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              h="120px"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <VStack
                align="start"
                spacing={1}
                justifyContent="center"
                h="100%"
              >
                <Text fontSize="md" color="gray.500" fontWeight="medium">
                  Total Portfolio Value
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                  ₹
                  {(
                    enterprisesData.reduce(
                      (sum, ent) => sum + Number(ent.worth || 0),
                      0
                    ) +
                    productsData.reduce(
                      (sum, prod) => sum + Number(prod.worth || 0),
                      0
                    )
                  ).toLocaleString()}
                </Text>
                <Text fontSize="md" color="gray.600">
                  <Text as="span" fontWeight="semibold">
                    Enterprises + Products
                  </Text>
                </Text>
              </VStack>
            </Box>
          </Flex>
        )}

        {/* Header Section */}
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Menu gutter={0}>
            <MenuButton
              as={ChakraButton}
              rightIcon={<FiChevronDown />}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              px={4}
              py={3}
              minW={{ base: "100%", md: "300px" }}
              justifyContent="space-between"
              _hover={{ bg: "white" }}
              _active={{ bg: "white" }}
            >
              {ROUND_OPTIONS.find((o) => o.value === selectedRound)?.label ||
                "Select Round"}
            </MenuButton>
            <MenuList borderRadius="lg" minW="300px" boxShadow="md">
              {ROUND_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  onClick={() => setSelectedRound(opt.value)}
                  fontWeight={
                    selectedRound === opt.value ? "semibold" : "normal"
                  }
                >
                  {opt.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>

        {/* Error Alert */}
        {error && (
          <Alert
            status="error"
            borderRadius="lg"
            p={4}
            border="1px solid"
            borderColor="red.200"
          >
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Table Container */}
        <TableContainer
          bg="white"
          borderRadius="lg"
          shadow="sm"
          border="1px solid"
          borderColor="gray.200"
          sx={{
            overflowX: "auto",
            "&::-webkit-scrollbar": {
              height: "8px",
              backgroundColor: `rgba(0, 0, 0, 0.05)`,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `rgba(0, 0, 0, 0.25)`,
              borderRadius: "10px",
            },
          }}
        >
          {loading ? (
            <Flex justify="center" p={12}>
              <VStack spacing={4}>
                <Spinner size="lg" color="blue.500" thickness="3px" />
                <Text color="gray.600" fontWeight="medium">
                  Loading your data...
                </Text>
              </VStack>
            </Flex>
          ) : filteredData.length === 0 ? (
            <VStack spacing={4} py={12} px={8}>
              <Text
                fontSize="lg"
                color="gray.500"
                fontWeight="medium"
                textAlign="center"
              >
                No{" "}
                {selectedRound === "3"
                  ? "trades"
                  : selectedRound === "enterprises"
                  ? "constructed enterprises"
                  : selectedRound === "products"
                  ? "purchased products"
                  : "bids"}{" "}
                found
                {selectedRound === "enterprises" || selectedRound === "products"
                  ? ""
                  : ` for Round ${selectedRound}`}
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center" maxW="md">
                Your transaction history will appear here once you start
                participating in the activities
              </Text>
            </VStack>
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

      {/* Trade Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="lg" p={2}>
          <ModalHeader
            textAlign="center"
            pb={4}
            fontSize="xl"
            fontWeight="bold"
          >
            Trade Details - {selectedTrade?.tradeId || "Unknown"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedTrade && (
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Status:</Text>
                  <Badge
                    colorScheme={
                      selectedTrade.status === "completed"
                        ? "green"
                        : selectedTrade.status === "pending"
                        ? "yellow"
                        : "red"
                    }
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    {selectedTrade.status}
                  </Badge>
                </HStack>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={4} fontSize="lg">
                    Team Details:
                  </Text>
                  <HStack
                    justify="space-between"
                    mb={2}
                    align="start"
                    spacing={4}
                  >
                    <Box flex={1} p={4} bg="blue.50" borderRadius="lg">
                      <Text
                        fontSize="sm"
                        color="blue.600"
                        fontWeight="medium"
                        mb={1}
                      >
                        Team One:
                      </Text>
                      <Text fontWeight="bold">
                        {selectedTrade?.teamOne?.teamName || "Unknown"}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        ({selectedTrade?.teamOne?.teamCode || "N/A"})
                      </Text>
                    </Box>
                    <Box flex={1} p={4} bg="green.50" borderRadius="lg">
                      <Text
                        fontSize="sm"
                        color="green.600"
                        fontWeight="medium"
                        mb={1}
                      >
                        Team Two:
                      </Text>
                      <Text fontWeight="bold">
                        {selectedTrade?.teamTwo?.teamName || "Unknown"}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        ({selectedTrade?.teamTwo?.teamCode || "N/A"})
                      </Text>
                    </Box>
                  </HStack>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={4} fontSize="lg">
                    Trade Exchange:
                  </Text>
                  <HStack align="start" justify="space-between" spacing={4}>
                    <Box flex={1} p={4} bg="blue.50" borderRadius="lg">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="blue.600"
                        mb={2}
                      >
                        {selectedTrade?.teamOne?.teamName || "Team One"} gives:
                      </Text>
                      <Text fontSize="sm" mb={1}>
                        <Text as="span" fontWeight="medium">
                          Items:
                        </Text>{" "}
                        {formatTradeItems(selectedTrade?.teamOneGives?.items)}
                      </Text>
                      {(selectedTrade?.teamOneGives?.money || 0) > 0 && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="medium">
                            Money:
                          </Text>{" "}
                          ₹
                          {(
                            selectedTrade?.teamOneGives?.money || 0
                          ).toLocaleString()}
                        </Text>
                      )}
                    </Box>
                    <Box flex={1} p={4} bg="green.50" borderRadius="lg">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="green.600"
                        mb={2}
                      >
                        {selectedTrade?.teamTwo?.teamName || "Team Two"} gives:
                      </Text>
                      <Text fontSize="sm" mb={1}>
                        <Text as="span" fontWeight="medium">
                          Items:
                        </Text>{" "}
                        {formatTradeItems(selectedTrade?.teamTwoGives?.items)}
                      </Text>
                      {(selectedTrade?.teamTwoGives?.money || 0) > 0 && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="medium">
                            Money:
                          </Text>{" "}
                          ₹
                          {(
                            selectedTrade?.teamTwoGives?.money || 0
                          ).toLocaleString()}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                </Box>

                <Divider />

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="medium">
                      Round:
                    </Text>{" "}
                    {selectedTrade?.roundNumber || "N/A"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="medium">
                      Date:
                    </Text>{" "}
                    {selectedTrade?.createdAt
                      ? new Date(selectedTrade.createdAt).toLocaleString()
                      : "N/A"}
                  </Text>
                </HStack>

                {selectedTrade?.executedBy && (
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    textAlign="center"
                    p={3}
                    bg="gray.50"
                    borderRadius="lg"
                  >
                    <Text as="span" fontWeight="medium">
                      Executed by:
                    </Text>{" "}
                    {selectedTrade.executedBy}
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter pt={4}>
            <ChakraButton
              colorScheme="blue"
              onClick={onClose}
              borderRadius="lg"
              px={8}
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
