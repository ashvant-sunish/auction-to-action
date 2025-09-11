import React, { useState, useRef, useEffect } from 'react'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Flex, Spinner, Center, useToast, Alert, AlertIcon
} from '@chakra-ui/react';
import { IoIosAdd } from "react-icons/io";
import { GoTriangleUp,GoTriangleDown } from "react-icons/go";
import axios from 'axios';
import serverUrl from '../../../../servercon';

function TeamTableAdmin() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [editingTeam, setEditingTeam] = useState(null);
    const [newTeam, setNewTeam] = useState({ teamCode: '', teamName: '', password: '', credit: 20000 });
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [isLoading, setIsLoading] = useState(true);
    const [teams, setTeams] = useState([]); // This will hold current display data
    const cancelRef = useRef();
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

    const handleView = (teamId) => {
        console.log('🔍 handleView called with teamId:', teamId);
        console.log('🔍 Current teams array:', teams);
        
        const team = teams.find(team => team._id === teamId || team.id === teamId);
        console.log('🔍 Found team:', team);
        
        if (team) {
            // Use actual backend field names
            const displayTeam = {
                _id: team._id,
                teamCode: team.teamCode,
                teamName: team.teamName,
                credit: team.credit,
                debit: team.debit || 0,
                balance: team.balance || (team.credit - (team.debit || 0)),
                inventory: team.inventory || [],
                resources: team.resources || {},
                original: team
            };
            console.log('🔍 Display team for modal:', displayTeam);
            setSelectedTeam(displayTeam);
            onOpen();
        } else {
            console.log('❌ Team not found for ID:', teamId);
            toast({
                title: "Team Not Found",
                description: "Could not find the selected team",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleEdit = () => {
        setEditingTeam({ ...selectedTeam });
        onClose();
        onEditOpen();
    };

    const handleDelete = () => {
        onClose();
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (token && selectedTeam._id) {
                await axios.delete(`${serverUrl}/api/admin/teams/${selectedTeam._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                toast({
                    title: "Team Deleted",
                    description: `Team ${selectedTeam.teamCode} deleted successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error deleting team:', error);
            toast({
                title: "Delete Failed",
                description: error.response?.data?.message || "Failed to delete team",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
        
        // Refresh data from backend
        await fetchTeamsData();
        onDeleteClose();
        setSelectedTeam(null);
    };

    const saveEdit = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (token && editingTeam._id) {
                const updateData = {
                    teamName: editingTeam.teamName,
                    credit: Number(editingTeam.credit),
                    debit: Number(editingTeam.debit || 0)
                };
                
                // Only include password if it was changed
                if (editingTeam.newPassword && editingTeam.newPassword.trim()) {
                    updateData.password = editingTeam.newPassword;
                }
                
                await axios.put(`${serverUrl}/api/admin/teams/${editingTeam._id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                toast({
                    title: "Team Updated",
                    description: `Team ${editingTeam.teamCode} updated successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error updating team:', error);
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update team",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
        
        // Refresh data from backend
        await fetchTeamsData();
        onEditClose();
        setEditingTeam(null);
    };

    const handleEditChange = (field, value) => {
        setEditingTeam(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewTeamChange = (field, value) => {
        setNewTeam(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddTeam = async () => {
        try {
            // Validate required fields
            if (!newTeam.teamCode || !newTeam.teamName || !newTeam.password) {
                toast({
                    title: "Missing Required Fields",
                    description: "Team Code, Team Name, and Password are required",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                });
                return;
            }

            const token = localStorage.getItem('adminToken');
            if (token) {
                const addData = {
                    teamCode: newTeam.teamCode,
                    teamName: newTeam.teamName,
                    password: newTeam.password,
                    initialBalance: Number(newTeam.credit) || 20000
                };
                
                await axios.post(`${serverUrl}/api/admin/teams`, addData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                toast({
                    title: "Team Added",
                    description: `Team ${newTeam.teamCode} created successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error adding team:', error);
            toast({
                title: "Add Team Failed",
                description: error.response?.data?.message || "Failed to create team",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
        
        // Refresh data from backend
        await fetchTeamsData();
        setNewTeam({ teamCode: '', teamName: '', password: '', credit: 20000 });
        onAddClose();
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

    const sortedData = [...displayTeams].sort((a, b) => {
        // Sort by team code
        const aCode = a.teamCode || '';
        const bCode = b.teamCode || '';
        return sortOrder === 'asc' ? aCode.localeCompare(bCode) : bCode.localeCompare(aCode);
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
                <Button 
                    leftIcon={<IoIosAdd />} 
                    colorScheme="blue" 
                    onClick={onAddOpen}
                    size="sm"
                    title="Add a new team"
                >
                    Add New Team
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
                            <Th 
                                cursor="pointer" 
                                _hover={{ bg: "gray.50" }}
                                onClick={toggleSortOrder}
                            >
                                <HStack spacing={1}>
                                    <Text>Team Code</Text>
                                    {sortOrder === 'asc' ? <GoTriangleUp /> : <GoTriangleDown />}
                                </HStack>
                            </Th>
                            <Th>Team Name</Th>
                            <Th>Credits</Th>
                            <Th>Debit</Th>
                            <Th>Balance</Th>
                            <Th>Action</Th>
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
                                    <Td color="green.600" fontWeight="semibold">{team.credit.toLocaleString()}</Td>
                                    <Td color="red.600" fontWeight="semibold">{team.debit.toLocaleString()}</Td>
                                    <Td color={team.balance >= 0 ? "green.600" : "red.600"} fontWeight="bold">
                                        {team.balance.toLocaleString()}
                                    </Td>
                                    <Td>
                                        <Button colorScheme='teal' size='sm' onClick={() => handleView(team._id)}>View</Button>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Team Code</Th>
                            <Th>Team Name</Th>
                            <Th>Credits</Th>
                            <Th>Debit</Th>
                            <Th>Balance</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </TableContainer>
            )}

            {/* Modal for Team Details */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Team Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedTeam && (
                            <VStack align="start" spacing={4}>
                                <HStack>
                                    <Text fontWeight="bold">Team Code:</Text>
                                    <Badge colorScheme="blue">{selectedTeam.teamCode}</Badge>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Team Name:</Text>
                                    <Text>{selectedTeam.teamName}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Credits:</Text>
                                    <Text color="green.500" fontWeight="semibold">{selectedTeam.credit.toLocaleString()}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Debit:</Text>
                                    <Text color="red.500" fontWeight="semibold">{selectedTeam.debit.toLocaleString()}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Balance:</Text>
                                    <Text color={selectedTeam.balance >= 0 ? "green.500" : "red.500"} fontWeight="bold">
                                        {selectedTeam.balance.toLocaleString()}
                                    </Text>
                                </HStack>
                                <Box>
                                    <Text fontWeight="bold" mb={2}>Inventory Items:</Text>
                                    {selectedTeam.inventory?.length > 0 ? (
                                        <VStack align="start" spacing={1}>
                                            {selectedTeam.inventory.map((item, index) => (
                                                <Badge key={index} colorScheme="purple" variant="outline">
                                                    {item}
                                                </Badge>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text color="gray.500" fontSize="sm">No items in inventory</Text>
                                    )}
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" mb={2}>Resources:</Text>
                                    {Object.keys(selectedTeam.resources).length > 0 ? (
                                        <VStack align="start" spacing={1}>
                                            {Object.entries(selectedTeam.resources).map(([resource, quantity]) => (
                                                <Text key={resource} fontSize="sm">
                                                    <Text as="span" fontWeight="medium">{resource}:</Text> {quantity}
                                                </Text>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text color="gray.500" fontSize="sm">No resources collected</Text>
                                    )}
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            colorScheme="green" 
                            mr={3} 
                            onClick={handleEdit}
                            title="Edit this team"
                        >
                            Edit
                        </Button>
                        <Button 
                            colorScheme="red" 
                            mr={3} 
                            onClick={handleDelete}
                            title="Delete this team"
                        >
                            Delete
                        </Button>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Team</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editingTeam && (
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Team Code</FormLabel>
                                    <Input
                                        value={editingTeam.teamCode}
                                        isReadOnly
                                        bg="gray.100"
                                        _placeholder={{ color: "gray.500" }}
                                        placeholder="Team Code cannot be changed"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Team Name</FormLabel>
                                    <Input
                                        value={editingTeam.teamName}
                                        onChange={(e) => handleEditChange('teamName', e.target.value)}
                                        placeholder="Enter team name"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Credits</FormLabel>
                                    <Input
                                        type="number"
                                        value={editingTeam.credit}
                                        onChange={(e) => handleEditChange('credit', e.target.value)}
                                        placeholder="Enter credit amount"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Debit</FormLabel>
                                    <Input
                                        type="number"
                                        value={editingTeam.debit}
                                        onChange={(e) => handleEditChange('debit', e.target.value)}
                                        placeholder="Enter debit amount"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>New Password (leave blank to keep current)</FormLabel>
                                    <Input
                                        type="password"
                                        value={editingTeam.newPassword || ''}
                                        onChange={(e) => handleEditChange('newPassword', e.target.value)}
                                        placeholder="Enter new password (optional)"
                                    />
                                </FormControl>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={saveEdit}>
                            Save Changes
                        </Button>
                        <Button variant="ghost" onClick={onEditClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Team
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete this team? This action cannot be undone.
                            {selectedTeam && (
                                <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                                    <Text><strong>Team Code:</strong> {selectedTeam.teamCode}</Text>
                                    <Text><strong>Team Name:</strong> {selectedTeam.teamName}</Text>
                                    <Text><strong>Credits:</strong> {selectedTeam.credit.toLocaleString()}</Text>
                                    <Text><strong>Balance:</strong> {selectedTeam.balance.toLocaleString()}</Text>
                                </Box>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Add New Team Modal */}
            <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Team</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Text mb={1} fontWeight="medium">Team Code *</Text>
                                <Input
                                    placeholder="Enter team code (e.g., TEAM01)"
                                    value={newTeam.teamCode}
                                    onChange={(e) => handleNewTeamChange('teamCode', e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text mb={1} fontWeight="medium">Team Name *</Text>
                                <Input
                                    placeholder="Enter team name"
                                    value={newTeam.teamName}
                                    onChange={(e) => handleNewTeamChange('teamName', e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text mb={1} fontWeight="medium">Password *</Text>
                                <Input
                                    type="password"
                                    placeholder="Enter team password"
                                    value={newTeam.password}
                                    onChange={(e) => handleNewTeamChange('password', e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text mb={1} fontWeight="medium">Initial Credits</Text>
                                <Input
                                    type="number"
                                    placeholder="Enter initial credits (default: 20000)"
                                    value={newTeam.credit}
                                    onChange={(e) => handleNewTeamChange('credit', e.target.value)}
                                />
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleAddTeam}>
                            Add Team
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    )
}

export default TeamTableAdmin
