import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import React, { useState } from 'react'
import DashboardLinksAdmin from './Rounds/DashboardLinks.Admin';

function RoundsAdmin({ ongoingRound, setfile }) {
    const [activeRound, setActiveRound] = useState(ongoingRound);
    if (setActiveRound == 'Round 1') {
        console.error("Please Start the round from dashboard");
    }

    const renderTabContent = () => {
        switch (activeRound) {
            case 'Not Started':
                return (
                    <Box p={4} bg="gray.50" borderRadius="md" mt={4}>
                        <p>Not Yet Started</p>
                    </Box>
                );
            case 'Round One':
                return (
                    <Box p={4} bg="green.50" borderRadius="md" mt={4}>
                        <p>Round one!</p>
                    </Box>
                );
            case 'Round Two':
                return (
                    <Box p={4} bg="blue.50" borderRadius="md" mt={4}>
                        <p>Round two!</p>
                    </Box>
                );
            case 'Round Three':
                return (
                    <Box p={4} bg="red.50" borderRadius="md" mt={4}>
                        <p>Round three!</p>
                    </Box>
                );
            case 'Round One Ended':
                return (
                    <Box p={4} bg="purple.50" borderRadius="md" mt={4}>
                        <p>Round one ended!</p>
                    </Box>
                );
            case 'Round Two Ended':
                return (
                    <Box p={4} bg="orange.50" borderRadius="md" mt={4}>
                        <p>Round two ended!</p>
                    </Box>
                );
            case 'Round Three Ended':
                return (
                    <Box p={4} bg="pink.50" borderRadius="md" mt={4}>
                        <p>Round three ended!</p>
                    </Box>
                );
            default:
                return (
                    <Box p={4} bg="gray.50" borderRadius="md" mt={4}>
                        <p>Not Yet Started</p>
                    </Box>
                );
        }
    };

    return (
        <Box>
            <Box bg="white" p={4} mt={2} borderRadius="md" width="80%" float="right">
                <Tabs variant='soft-rounded' index={activeRound === 'Not Started' ? 4 : activeRound === 'Round One' ? 0 : activeRound === 'Round One Ended' ? 4 : activeRound === 'Round Two' ? 1 : activeRound === 'Round Two Ended' ? 4 : activeRound === 'Round Three' ? 2 : activeRound === 'Round Three Ended' ? 4 : null}>
                    <TabList>
                        {activeRound === 'Not Started' ? <>
                            <Tab isDisabled>Round 1</Tab>
                            <Tab isDisabled>Round 2</Tab>
                            <Tab isDisabled>Round 3</Tab>
                        </> : activeRound === "Round One" ? <>
                            <Tab>Round 1</Tab>
                            <Tab isDisabled>Round 2</Tab>
                            <Tab isDisabled>Round 3</Tab>
                        </> : activeRound === "Round Two" ? <>
                            <Tab isDisabled>Round 1</Tab>
                            <Tab>Round 2</Tab>
                            <Tab isDisabled>Round 3</Tab>
                        </> : activeRound === "Round Three" ? <>
                            <Tab isDisabled>Round 1</Tab>
                            <Tab isDisabled>Round 2</Tab>
                            <Tab>Round 3</Tab>
                        </> : activeRound === "Round One Ended" ? <>
                            <Tab isDisabled>Round 1</Tab>
                            <Tab isDisabled>Round 2</Tab>
                            <Tab isDisabled>Round 3</Tab>
                        </> : activeRound === "Round Two Ended" ? <>
                            <Tab isDisabled>Round 1</Tab>
                            <Tab isDisabled>Round 2</Tab>
                            <Tab isDisabled>Round 3</Tab>
                        </> : activeRound === "Round Three Ended" ? <>
                            <Tab isDisabled>Round 1</Tab>
                            <Tab isDisabled>Round 2</Tab>
                            <Tab isDisabled>Round 3</Tab>
                        </> : null}
                        <Tab hidden>Reset</Tab>
                    </TabList>
                </Tabs>
                {renderTabContent()}
            </Box>
            <DashboardLinksAdmin setfile={setfile} />
        </Box>
    )
}

export default RoundsAdmin