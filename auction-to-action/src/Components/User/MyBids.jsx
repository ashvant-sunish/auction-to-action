import React, { useState } from "react";
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
} from "@chakra-ui/react";

// Sample data
const allBids = [
  { id: 1, text: "2 × Property, 3 × Skilled Labour", amount: "5,000", round: "Round 1" },
  {
    id: 2,
    text: "1 × Property, 2 × Machinery & Tools, 1 × Utilities",
    amount: "4,000",
    round: "Round 1"
  },
  { id: 3, text: "3 × Technology", amount: "5,250", round: "Round 2" },
  {
    id: 4,
    text: "2 × Property, 2 × Construction Material, 1 × Skilled Labour",
    amount: "5,000",
    round: "Round 2"
  },
  { id: 5, text: "3 × Machinery & Tools, 2 × Skilled Labour", amount: "5,250", round: "Round 3", teamName: "Team Alpha", propertyGained: "1 x Property A", amountGained: "3,000" },
  {
    id: 62,
    text: "1 × Property, 3 × Office Space, 2 × Skilled Labour",
    amount: "4,750",
    round: "Round 3",
    teamName: "Team Beta",
    propertyGained: "1 x Property B",
    amountGained: "2,500"
  },
  { id: 63, text: "5 × Technology", amount: "8,750", round: "Round 4" },
  { id: 68, text: "3 × Technology, 2 × Utilities", amount: "5,750", round: "Round 4" },
  {
    id: 71,
    text: "3 × Property, 2 × Office Space, 1 × Technology",
    amount: "7,000",
    round: "Round 5"
  },
  {
    id: 75,
    text: "3 × Property, 4 × Skilled Labour, 2 × Utilities",
    amount: "6,000",
    round: "Round 5"
  },
];

const enterpriseBids = [
  { id: 101, enterpriseName: "TechCorp Ltd.", enterpriseNumber: "ENT-001", amount: "12,500" },
  { id: 102, enterpriseName: "BuildMaster Inc.", enterpriseNumber: "ENT-002", amount: "9,800" },
  { id: 103, enterpriseName: "InfraSolutions Co.", enterpriseNumber: "ENT-003", amount: "15,200" },
  { id: 104, enterpriseName: "ConstructPro Group", enterpriseNumber: "ENT-004", amount: "11,000" },
  { id: 105, enterpriseName: "UrbanDevelopers LLC", enterpriseNumber: "ENT-005", amount: "13,750" },
];

const myTeamBidIds = [75, 71, 68, 63, 62, 5];
const myTeamHistory = allBids
  .filter((bid) => myTeamBidIds.includes(bid.id))
  .sort((a, b) => b.id - a.id);

function MyBids() {
  const [enterpriseIndex, setEnterpriseIndex] = useState(0);

  const round1History = myTeamHistory.filter((bid) => bid.round === "Round 1");
  const round2History = myTeamHistory.filter((bid) => bid.round === "Round 2");
  const round3History = myTeamHistory.filter((bid) => bid.round === "Round 3");

  const renderRoundAccordion = (title, historyData, borderColor) => (
    <AccordionItem 
      border="1px" 
      borderColor={borderColor}
      borderRadius="md" 
      overflow="hidden" 
      mb={4}
    >
      <AccordionButton 
        bg="gray.50" 
        _hover={{ bg: "gray.100" }} 
        py={4} 
      >
        <Box flex="1" textAlign="left">
          <Heading size="md">{title}</Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            View your bidding activity for {title}
          </Text>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Bid No.</Th>
                <Th>Items</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {historyData.length > 0 ? (
                historyData.map((bid) => (
                  <Tr key={bid.id}>
                    <Td fontWeight="bold">BID {bid.id}</Td>
                    <Td>{bid.text}</Td>
                    <Td isNumeric>₹{bid.amount}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={3} textAlign="center">No bids found for {title}.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </AccordionPanel>
    </AccordionItem>
  );

  const renderRound3Accordion = (title, historyData, borderColor) => (
    <AccordionItem 
      border="1px" 
      borderColor={borderColor}
      borderRadius="md" 
      overflow="hidden" 
      mb={4}
    >
      <AccordionButton 
        bg="gray.50" 
        _hover={{ bg: "gray.100" }} 
        py={4} 
      >
        <Box flex="1" textAlign="left">
          <Heading size="md">{title}</Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            View your bidding activity for {title}
          </Text>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Team Name</Th>
                <Th>Property Bidded</Th>
                <Th isNumeric>Amount Bidded</Th>
                <Th>Property Gained</Th>
                <Th isNumeric>Amount Gained</Th>
              </Tr>
            </Thead>
            <Tbody>
              {historyData.length > 0 ? (
                historyData.map((bid) => (
                  <Tr key={bid.id}>
                    <Td fontWeight="medium">{bid.teamName}</Td>
                    <Td>{bid.text}</Td>
                    <Td isNumeric>₹{bid.amount}</Td>
                    <Td>{bid.propertyGained}</Td>
                    <Td isNumeric>₹{bid.amountGained}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center">No bids found for {title}.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </AccordionPanel>
    </AccordionItem>
  );


  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>
        History
      </Heading>

      <Accordion allowMultiple>
        {renderRoundAccordion("Round 1 History", round1History, "blue.100")}
        {renderRoundAccordion("Round 2 History", round2History, "blue.100")}
        {renderRound3Accordion("Round 3 History", round3History, "blue.100")}
      </Accordion>
      
      {/* Enterprise History Accordion */}
      <Accordion allowToggle index={enterpriseIndex} onChange={(index) => setEnterpriseIndex(index)} mt={6}>
        <AccordionItem 
          border="1px" 
          borderColor="green.100" 
          borderRadius="md" 
          overflow="hidden"
        >
          <AccordionButton bg="gray.50" _hover={{ bg: "gray.100" }} py={4}>
            <Box flex="1" textAlign="left">
              <Heading size="md">Enterprise History</Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                View your enterprise bidding information
              </Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Enterprise Name</Th>
                    <Th>Enterprise Number</Th>
                    <Th isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {enterpriseBids.map((bid) => (
                    <Tr key={bid.id}>
                      <Td fontWeight="medium">{bid.enterpriseName}</Td>
                      <Td>{bid.enterpriseNumber}</Td>
                      <Td isNumeric>₹{bid.amount}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}

export default MyBids;