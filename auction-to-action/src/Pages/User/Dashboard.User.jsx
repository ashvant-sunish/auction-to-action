import React from "react";
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
} from "@chakra-ui/react";
import Sidebar from "../../Components/Login/Dashboard/Sidebar";
import Navbar from "../../Components/Login/Dashboard/Navbar";
import { MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { FaRupeeSign, FaGavel } from "react-icons/fa";

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

const AvailableMaterialsTable = () => {
  const history = [
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

function UserDashboard() {
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
              title="Credit"
              amount="₹53,000"
              percentage="+55%"
              isUp={true}
            />
            <StatCard
              icon={MdTrendingDown}
              title="Debit"
              amount="₹2,300"
              percentage="-3%"
              isUp={false}
            />
            <StatCard
              icon={FaRupeeSign}
              title="Property Amount"
              amount="₹2,00,000"
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
            <AvailableMaterialsTable />
            <CurrentBiddingInfo />
          </SimpleGrid>
        </Box>
      </Box>
    </Flex>
  );
}

export default UserDashboard;
