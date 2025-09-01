import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
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
} from "@chakra-ui/react";
import { MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { FaRupeeSign, FaGavel } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import serverUrl from "../../servercon";

const StatCard = ({ icon, title, amount, percentage, isUp }) => (
  <Stat p={4} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
    <Flex>
      <Box p={3} mr={4} bg={isUp ? "green.100" : "red.100"} borderRadius="full">
        <Icon as={icon} color={isUp ? "green.500" : "red.500"} w={6} h={6} />
      </Box>
      <Box>
        <StatLabel color="gray.500">{title}</StatLabel>
        <StatNumber fontWeight="bold">{amount}</StatNumber>
        <StatHelpText>
          <StatArrow type={isUp ? "increase" : "decrease"} />
          {percentage}
        </StatHelpText>
      </Box>
    </Flex>
  </Stat>
);

const AvailableMaterialsTable = ({ transactions }) => {
  const sampleHistory = [
    { material: "2 × Property, 3 × Skilled Labour", items: 5, amount: "5,000" },
    {
      material: "1 × Property, 2 × Machinery & Tools, 1 × Utilities",
      items: 4,
      amount: "4,000",
    },
    { material: "3 × Technology", items: 3, amount: "5,250" },
  ];

  const history =
    transactions?.length > 0
      ? transactions.map((transaction) => ({
          material: transaction.itemId?.name || "Unknown Item",
          items: 1,
          amount: transaction.price?.toString() || "0",
        }))
      : sampleHistory;

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      shadow="md"
      h="full"
      display="flex"
      flexDirection="column"
    >
      <Heading size="sm" mb={3}>
        Available Materials
      </Heading>
      <TableContainer overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead position="sticky" top={0} bg="white" zIndex={1}>
            <Tr>
              <Th>Material</Th>
              <Th isNumeric>Total Items</Th>
              <Th isNumeric>Total Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((item, index) => (
              <Tr key={index}>
                <Td>{item.material}</Td>
                <Td isNumeric>{item.items}</Td>
                <Td isNumeric>₹{item.amount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const CurrentBiddingInfo = () => {
  const currentBidNumber = 75;
  const currentItem = "3 × Property, 4 × Skilled Labour, 2 × Utilities";
  const recentBids = [
    { team: "Team Delta", amount: "6,000" },
    { team: "Team Alpha", amount: "5,800" },
    { team: "Team Beta", amount: "5,750" },
  ];

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      shadow="md"
      h="full"
      display="flex"
      flexDirection="column"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Heading size="sm">Live Bidding</Heading>
          <Flex align="center" bg="blue.100" p={2} borderRadius="md">
            <Icon as={FaGavel} color="blue.500" />
            <Text ml={2} fontWeight="bold" color="blue.800">
              Bid No: {currentBidNumber}
            </Text>
          </Flex>
        </HStack>
        <Box>
          <Text fontSize="md" fontWeight="bold">
            {currentItem}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={2}>
            Recent Bids:
          </Text>
          <VStack align="stretch" mt={2} spacing={2}>
            {recentBids.map((bid, index) => (
              <HStack
                key={index}
                justify="space-between"
                bg="gray.50"
                p={2}
                borderRadius="md"
              >
                <Text fontSize="sm">{bid.team}</Text>
                <Text fontWeight="bold">₹{bid.amount}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

function DashboardContent() {
  const [budget, setBudget] = useState("₹0");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${serverUrl}/api/team/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/");
          }
          throw new Error("Failed to fetch");
        }
        const data = await response.json();
        setBudget(`₹${data.budget?.toLocaleString() || 0}`);
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, toast]);

  const calculateDebit = () => {
    const totalDebit = transactions.reduce(
      (sum, transaction) => sum + (transaction.price || 0),
      0
    );
    return `₹${totalDebit.toLocaleString()}`;
  };

  const calculatePropertyAmount = () => {
    // Placeholder logic
    return `₹0`;
  };

  if (loading) {
    return (
      <Flex h="100%" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box
      p={6}
      h="calc(100vh - 72px)"
      display="flex"
      flexDirection="column"
      gap={4}
      overflow="hidden"
    >
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        <StatCard
          icon={MdTrendingUp}
          title="Balance"
          amount={budget}
          percentage="+55%"
          isUp={true}
        />
        <StatCard
          icon={MdTrendingDown}
          title="Debit"
          amount={calculateDebit()}
          percentage="-3%"
          isUp={false}
        />
        <StatCard
          icon={FaRupeeSign}
          title="Property Amount"
          amount={calculatePropertyAmount()}
          percentage="+5%"
          isUp={true}
        />
      </SimpleGrid>

      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={4}
        mt={0}
        flex="1"
        overflow="hidden"
        alignItems="start"
      >
        <AvailableMaterialsTable transactions={transactions} />
        <CurrentBiddingInfo />
      </SimpleGrid>
    </Box>
  );
}

export default DashboardContent;
