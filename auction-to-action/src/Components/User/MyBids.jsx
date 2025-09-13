import React from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";

// This data would eventually come from your backend
const allBids = [
  { id: 1, text: "2 × Property, 3 × Skilled Labour", amount: "5,000" },
  {
    id: 2,
    text: "1 × Property, 2 × Machinery & Tools, 1 × Utilities",
    amount: "4,000",
  },
  { id: 3, text: "3 × Technology", amount: "5,250" },
  {
    id: 4,
    text: "2 × Property, 2 × Construction Material, 1 × Skilled Labour",
    amount: "5,000",
  },
  { id: 5, text: "3 × Machinery & Tools, 2 × Skilled Labour", amount: "5,250" },
  {
    id: 62,
    text: "1 × Property, 3 × Office Space, 2 × Skilled Labour",
    amount: "4,750",
  },
  { id: 63, text: "5 × Technology", amount: "8,750" },
  { id: 68, text: "3 × Technology, 2 × Utilities", amount: "5,750" },
  {
    id: 71,
    text: "3 × Property, 2 × Office Space, 1 × Technology",
    amount: "7,000",
  },
  {
    id: 75,
    text: "3 × Property, 4 × Skilled Labour, 2 × Utilities",
    amount: "6,000",
  },
];
const myTeamBidIds = [75, 71, 68, 63, 5];
const myTeamHistory = allBids
  .filter((bid) => myTeamBidIds.includes(bid.id))
  .sort((a, b) => b.id - a.id);

function MyBids() {
  return (
    <Box>
      <Heading size="lg" mb={6}>
        My Bidding History
      </Heading>
      <TableContainer bg="white" p={4} borderRadius="lg" shadow="md">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Bid No.</Th>
              <Th>Items</Th>
              <Th isNumeric>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {myTeamHistory.map((bid) => (
              <Tr key={bid.id}>
                <Td fontWeight="bold">BID {bid.id}</Td>
                <Td>{bid.text}</Td>
                <Td isNumeric>₹{bid.amount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default MyBids;