import React, { useState, useEffect } from 'react'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Text, HStack,
    Flex, Spinner, Center, useToast,
} from '@chakra-ui/react';
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";
import axios from 'axios';
import serverUrl from '../../../../servercon';

function WorthCalculatorTableAdmin() {
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [isLoading, setIsLoading] = useState(true);
    const [teams, setTeams] = useState([]); // This will hold current display data
    const toast = useToast();

    // Fetch teams data from backend
    useEffect(() => {
        fetchTeamsData();
    }, []);

    const fetchTeamsData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');

            if (!token) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in as admin to access teams",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${serverUrl}/api/admin/teams`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Backend returns array of teams directly
            const teamsArray = Array.isArray(response.data) ? response.data : [];
            console.log('📊 Fetched teams:', teamsArray);
            setTeams(teamsArray);

            toast({
                title: "Teams Loaded",
                description: `Successfully loaded ${teamsArray.length} teams`,
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast({
                title: "Error Loading Teams",
                description: error.response?.data?.message || "Failed to load teams",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            setTeams([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Update the calculate functions
    const calculateEnterpriseWorth = (teamCode) => {
        const team = displayTeams.find(t => t.teamCode === teamCode);
        if (!team || !team.original.enterprises) return 0;

        // Sum up the worth of all enterprises
        const totalWorth = team.original.enterprises.reduce((total, enterprise) => {
            const worth = parseInt(enterprise.worth) || 0;
            return total + worth;
        }, 0);

        return totalWorth;
    };

    const calculateProductWorth = (teamCode) => {
        const team = displayTeams.find(t => t.teamCode === teamCode);
        if (!team || !team.original.products) return 0;

        // Sum up the worth of all products
        const totalWorth = team.original.products.reduce((total, product) => {
            const worth = parseInt(product.worth) || 0;
            return total + worth;
        }, 0);

        return totalWorth;
    };
    const calculateTotalWorth = (teamCode) => {
        // Get individual worths
        const enterpriseWorth = calculateEnterpriseWorth(teamCode);
        const productWorth = calculateProductWorth(teamCode);
        const team = displayTeams.find(t => t.teamCode === teamCode);
        const balance = parseInt(team?.balance || 0);

        // Sum up all components
        const totalWorth = enterpriseWorth + productWorth + balance;

        return totalWorth;
    };
    // This function works with the existing /admin/updateTeam endpoint
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    // Create display data with proper sorting
    const displayTeams = teams.map((team, index) => {
        return {
            _id: team._id,
            teamCode: team.teamCode,
            teamName: team.teamName,
            credit: team.credit,
            debit: team.debit || 0,
            balance: team.balance || (team.credit - (team.debit || 0)),
            inventory: team.inventory || [],
            resources: team.resources || {},
            original: team // Keep reference to original for operations
        };
    });

    // Update the sortedData calculation
    const sortedData = [...displayTeams].sort((a, b) => {
        // Calculate total worth for both teams
        const worthA = calculateTotalWorth(a.teamCode);
        const worthB = calculateTotalWorth(b.teamCode);

        // Sort based on worth
        return sortOrder === 'asc'
            ? worthA - worthB
            : worthB - worthA;
    });

    return (
        <Box bg="white" p={4} mt={2} mb={2} borderRadius="md">
            {/* Add New Team Button */}
            <Flex mb={4} justify="space-between" align="center">
                <Button
                    size="sm"
                    colorScheme="gray"
                    onClick={fetchTeamsData}
                    isLoading={isLoading}
                >
                    Refresh Data
                </Button>
            </Flex>

            {isLoading ? (
                <Center py={10}>
                    <Spinner size="xl" />
                    <Text ml={3}>Loading teams...</Text>
                </Center>
            ) : (
                <TableContainer>
                    <Table variant='striped' colorScheme='teal'>
                        <TableCaption>Team Management Table</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Team Code</Th>
                                <Th>Team Name</Th>
                                <Th>Enterprise Worth</Th>
                                <Th>Product Worth</Th>
                                <Th>Balance</Th>
                                <Th
                                    cursor="pointer"
                                    _hover={{ bg: "gray.50" }}
                                    onClick={toggleSortOrder}
                                >
                                    <HStack spacing={1}>
                                        <Text>Total Worth</Text>
                                        {sortOrder === 'asc'
                                            ? <GoTriangleUp title="Sort Ascending" />
                                            : <GoTriangleDown title="Sort Descending" />
                                        }
                                    </HStack>
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sortedData.length === 0 ? (
                                <Tr>
                                    <Td colSpan="6" textAlign="center" py={8}>
                                        <Text color="gray.500" fontSize="lg">
                                            No teams found. Click "Add New Team" to create one.
                                        </Text>
                                    </Td>
                                </Tr>
                            ) : (
                                sortedData.map((team) => (
                                    <Tr key={team._id}>
                                        <Td fontWeight="semibold">{team.teamCode}</Td>
                                        <Td>{team.teamName}</Td>
                                        <Td isNumeric>₹{calculateEnterpriseWorth(team.teamCode).toLocaleString()}</Td>
                                        <Td isNumeric>₹{calculateProductWorth(team.teamCode).toLocaleString()}</Td>
                                        <Td color={team.balance >= 0 ? "green.600" : "red.600"} fontWeight="bold" isNumeric>
                                            ₹{team.balance.toLocaleString()}
                                        </Td>
                                        <Td fontWeight="bold" isNumeric>
                                            ₹{calculateTotalWorth(team.teamCode).toLocaleString()}
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>Team Code</Th>
                                <Th>Team Name</Th>
                                <Th>Enterprise Worth</Th>
                                <Th>Product Worth</Th>
                                <Th>Balance</Th>
                                <Th>Total Worth</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            )
            }

        </Box >
    )
}

export default WorthCalculatorTableAdmin
