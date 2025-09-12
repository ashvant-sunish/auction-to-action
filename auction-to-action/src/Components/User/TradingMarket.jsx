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

const allBids = [
  { id: 1, text: "2 × Property, 3 × Skilled Labour" },
  { id: 2, text: "1 × Property, 2 × Machinery & Tools, 1 × Utilities" },
  { id: 3, text: "3 × Technology" },
  {
    id: 4,
    text: "2 × Property, 2 × Construction Material, 1 × Skilled Labour",
  },
  { id: 5, text: "3 × Machinery & Tools, 2 × Skilled Labour" },
  { id: 62, text: "1 × Property, 3 × Office Space, 2 × Skilled Labour" },
  { id: 63, text: "5 × Technology" },
  {
    id: 64,
    text: "3 × Property, 3 × Construction Material, 1 × Skilled Labour",
  },
  { id: 65, text: "2 × Property, 3 × Electricity Supply, 2 × Skilled Labour" },
  { id: 68, text: "3 × Technology, 2 × Utilities" },
  { id: 71, text: "3 × Property, 2 × Office Space, 1 × Technology" },
  {
    id: 72,
    text: "2 × Construction Material, 4 × Skilled Labour, 2 × Utilities",
  },
  { id: 75, text: "3 × Property, 4 × Skilled Labour, 2 × Utilities" },
];

const teamBidHistory = [
  { bidId: 72, member: "Member 3" },
  { bidId: 65, member: "Member 1" },
  { bidId: 64, member: "Member 2" },
  { bidId: 63, member: "Member 4" },
  { bidId: 62, member: "Member 1" },
  { bidId: 5, member: "Member 3" },
  { bidId: 2, member: "Member 2" },
];

const fullTeamHistory = allBids
  .map((bid) => {
    const teamBid = teamBidHistory.find((tb) => tb.bidId === bid.id);
    return teamBid ? { ...bid, member: teamBid.member } : null;
  })
  .filter(Boolean)
  .sort((a, b) => b.id - a.id);

function TeamBids() {
  return (
    <Box>
      <Heading size="lg" mb={6}>
        Team Bidding History
      </Heading>
      <TableContainer bg="white" p={4} borderRadius="lg" shadow="md">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Bid No.</Th>
              <Th>Items</Th>
              <Th>Bid By</Th>
            </Tr>
          </Thead>
          <Tbody>
            {fullTeamHistory.map((bid) => (
              <Tr key={bid.id}>
                <Td fontWeight="bold">BID {bid.id}</Td>
                <Td>{bid.text}</Td>
                <Td>{bid.member}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TeamBids;
