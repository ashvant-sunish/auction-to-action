import React, { useState } from 'react'
import { Box, Heading, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Button, Badge, HStack } from '@chakra-ui/react'
import RoundOneBidHistory from './BidHistory/RoundOne.BidHistory';
import RoundTwoBidHistory from './BidHistory/RoundTwo.BidHistory';
import RoundThreeBidHistory from './BidHistory/RoundThree.BidHistory';

function BidHistoryAdmin() {

    return (
        <Box width="80%" float="right">
            <Box bg="transparent" p={4} mt={2} borderRadius="md" textColor="white">
                <Heading>Bid History</Heading>
            </Box>
        <Accordion allowMultiple mt={4} p={4} bg="white" borderRadius="md">
                <AccordionItem>
                    <AccordionButton _expanded={{ bg: 'blue.100', color: 'blue.800' }}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">
                            Round One
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <RoundOneBidHistory />
                    </AccordionPanel>
                </AccordionItem>
        </Accordion>
        <Accordion allowMultiple mt={4} p={4} bg="white" borderRadius="md">
                <AccordionItem>
                    <AccordionButton _expanded={{ bg: 'green.100', color: 'green.800' }}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">
                            Round Two
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <RoundTwoBidHistory />
                    </AccordionPanel>
                </AccordionItem>
        </Accordion>
        <Accordion allowMultiple mt={4} mb={2} p={4} bg="white" borderRadius="md">
                <AccordionItem>
                    <AccordionButton _expanded={{ bg: 'orange.100', color: 'orange.800' }}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">
                            Round Three
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <RoundThreeBidHistory />
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    )
}

export default BidHistoryAdmin
