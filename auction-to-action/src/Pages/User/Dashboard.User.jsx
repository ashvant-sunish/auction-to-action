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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import Sidebar from "../../Components/Login/Dashboard/Sidebar";
import Navbar from "../../Components/Login/Dashboard/Navbar";
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

function UserDashboard() {
  const [budget, setBudget] = useState('₹0');
  const [teamData, setTeamData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  
  //const [error, setError] = useState(null);

  // Get JWT token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Team Data Fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.log('❌ No token found, redirecting to login...');
        toast({
          title: "Authentication Required",
          description: "Please log in to access dashboard",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
        return;
      }

      console.log('🔑 Token found, fetching dashboard data...');
      const response = await fetch(`${serverUrl}/api/team/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Token expired, redirecting to login...');
          localStorage.removeItem('token');
          localStorage.removeItem('teamData');
          navigate('/');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Fetched team data:', data);
      
      // Update state with fetched data
      setTeamData(data);
      setBudget(`₹${data.budget?.toLocaleString() || 0}`);
      
      setLoading(false);
      return data;
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Fetch data on page load
  useEffect(() => {
    console.log('🚀 Dashboard loaded, fetching team data...');
    fetchData();
  }, []); // Empty dependency array means this runs once on component mount

  // Calculate debit amount from transactions
  const calculateDebit = () => {
    const totalDebit = transactions.reduce((sum, transaction) => sum + (transaction.price || 0), 0);
    return `₹${totalDebit.toLocaleString()}`;
  };

  // Calculate property amount (placeholder - you can modify this logic)
  const calculatePropertyAmount = () => {
    const propertyTransactions = transactions.filter(t => 
      t.itemId?.name?.toLowerCase().includes('property')
    );
    const totalProperty = propertyTransactions.reduce((sum, transaction) => sum + (transaction.price || 0), 0);
    return `₹${totalProperty.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Flex>
    );
  }

/*  if (error) {
    return (
      <Flex h="100vh" align="center" justify="center" p={4}>
        <Alert status="error" borderRadius="lg" maxW="md">
          <AlertIcon />
          {error}
        </Alert>
      </Flex>
    );
  }
*/
  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar />
      <Box
        flex="1"
        ml={{ base: 0, md: "260px" }}
        bg="gray.100"
        h="100vh"
        overflow="hidden"
      >
        <Navbar />
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
      </Box>
    </Flex>
  );
}

const AvailableMaterialsTable = ({ transactions }) => {
  // Use real transaction data if available, otherwise use sample data
  const sampleHistory = [
    { material: "2 × Property, 3 × Skilled Labour", items: 5, amount: "5,000" },
    {
      material: "1 × Property, 2 × Machinery & Tools, 1 × Utilities",
      items: 4,
      amount: "4,000",
    },
    { material: "3 × Technology", items: 3, amount: "5,250" },
    {
      material: "2 × Property, 2 × Construction Material, 1 × Skilled Labour",
      items: 5,
      amount: "5,000",
    },
    {
      material: "3 × Machinery & Tools, 2 × Skilled Labour",
      items: 5,
      amount: "5,250",
    },
    {
      material: "2 × Office Space, 3 × Skilled Labour",
      items: 5,
      amount: "4,250",
    },
    {
      material: "1 × Technology, 2 × Electricity Supply, 2 × Skilled Labour",
      items: 5,
      amount: "4,500",
    },
    { material: "3 × Property, 2 × Technology", items: 5, amount: "8,000" },
    {
      material: "2 × Construction Material, 3 × Skilled Labour, 1 × Utilities",
      items: 6,
      amount: "4,250",
    },
    {
      material: "1 × Property, 1 × Electricity Supply, 2 × Machinery & Tools",
      items: 4,
      amount: "3,750",
    },
    { material: "2 × Property, 2 × Technology", items: 4, amount: "6,000" },
    {
      material: "3 × Machinery & Tools, 2 × Utilities",
      items: 5,
      amount: "4,000",
    },
    { material: "2 × Property, 3 × Office Space", items: 5, amount: "5,750" },
    {
      material: "2 × Technology, 3 × Skilled Labour",
      items: 5,
      amount: "5,250",
    },
    { material: "3 × Property, 1 × Transportation", items: 4, amount: "5,500" },
    {
      material: "1 × Property, 3 × Machinery & Tools, 2 × Utilities",
      items: 6,
      amount: "4,750",
    },
    { material: "4 × Technology", items: 4, amount: "7,000" },
    {
      material: "3 × Property, 2 × Electricity Supply",
      items: 5,
      amount: "6,000",
    },
    {
      material: "3 × Machinery & Tools, 3 × Construction Material",
      items: 6,
      amount: "5,000",
    },
    { material: "2 × Property, 3 × Transportation", items: 5, amount: "4,750" },
  ];

  // Convert transactions to material format or use sample data
  const history = transactions?.length > 0 ? 
    transactions.map(transaction => ({
      material: transaction.itemId?.name || 'Unknown Item',
      items: 1,
      amount: transaction.price?.toString() || '0',
    })) : 
    sampleHistory;

  const materialData = history.reduce((acc, bid) => {
    const materials = bid.material.split(", ");
    const bidAmount = parseInt(bid.amount.replace(/,/g, ""), 10);
    materials.forEach((part) => {
      const [count, ...nameParts] = part.split(" × ");
      const name = nameParts.join(" × ").trim();
      if (!acc[name]) {
        acc[name] = { count: 0, totalAmount: 0 };
      }
      acc[name].count += parseInt(count, 10);
      acc[name].totalAmount += bidAmount;
    });
    return acc;
  }, {});

  const aggregatedMaterials = Object.entries(materialData).map(
    ([name, data]) => ({
      name,
      count: data.count,
      amount: data.totalAmount.toLocaleString(),
    })
  );

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
      <TableContainer
        maxH="320px"
        overflowY="auto"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.100"
        px={1}
        sx={{
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-thumb": { borderRadius: "10px" },
        }}
      >
        <Table variant="simple" size="sm">
          <Thead position="sticky" top={0} bg="white" zIndex={1}>
            <Tr>
              <Th>Material</Th>
              <Th isNumeric>Total Items</Th>
              <Th isNumeric>Total Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {aggregatedMaterials.map((item, index) => (
              <Tr key={index}>
                <Td>{item.name}</Td>
                <Td isNumeric>{item.count}</Td>
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

export default UserDashboard;
