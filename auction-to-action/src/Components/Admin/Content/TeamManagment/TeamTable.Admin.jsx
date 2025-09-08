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
    const [newTeam, setNewTeam] = useState({ team_number: '', team_credential: '', credits: '', is_active: true });
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
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${serverUrl}/api/admin/teams`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Handle different possible response structures
            let teamsArray = [];
            if (Array.isArray(response.data)) {
                // Response is directly an array of teams
                teamsArray = response.data;
            } else if (response.data && response.data.teams && Array.isArray(response.data.teams)) {
                // Response has teams property
                teamsArray = response.data.teams;
            }

            setTeams(teamsArray);
        } catch (error) {
            console.error('Error fetching teams:', error);
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
            // Convert to display format for modal
            const displayTeam = {
                id: team._id || team.id,
                team_number: team.teamNumber,
                team_credential: team.teamCredential,
                credits: team.credit,
                is_active: team.isActive,
                debit: team.debit || 0,
                original: team
            };
            console.log('🔍 Display team for modal:', displayTeam);
            setSelectedTeam(displayTeam);
            onOpen();
        } else {
            console.log('❌ Team not found for ID:', teamId);
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
            }
        } catch (error) {
            console.error('Error deleting team:', error);
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
                    team_number: editingTeam.team_number,
                    team_credential: editingTeam.team_credential,
                    credits: editingTeam.credits,
                    is_active: editingTeam.is_active
                };
                
                await axios.put(`${serverUrl}/api/admin/teams/${editingTeam._id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Error updating team:', error);
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
            const token = localStorage.getItem('adminToken');
            if (token) {
                const addData = {
                    team_number: newTeam.team_number,
                    team_credential: newTeam.team_credential,
                    credits: newTeam.credits,
                    is_active: newTeam.is_active || true
                };
                
                await axios.post(`${serverUrl}/api/admin/teams`, addData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Error adding team:', error);
        }
        
        // Refresh data from backend
        await fetchTeamsData();
        setNewTeam({ team_number: '', team_credential: '', credits: '', is_active: true });
        onAddClose();
    };

    // This function works with the existing /admin/updateTeam endpoint
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    // Create display data with proper sorting
    const displayTeams = teams.map((team, index) => {
        const displayTeam = {
            id: team._id || team.id || (index + 1),
            team_number: team.teamNumber || (index + 1),
            team_credential: team.teamCredential || `REG${String(index + 1).padStart(3, '0')}`,
            credits: team.credit || '0',
            is_active: team.isActive || false,
            original: team // Keep reference to original for operations
        };
        return displayTeam;
    });

    const sortedData = [...displayTeams].sort((a, b) => {
        const aNum = a.team_number;
        const bNum = b.team_number;
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
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
                                    <Text>Team No</Text>
                                    {sortOrder === 'asc' ? <GoTriangleUp /> : <GoTriangleDown />}
                                </HStack>
                            </Th>
                            <Th>Team Credential</Th>
                            <Th>Credits</Th>
                            <Th>Status</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedData.length === 0 ? (
                            <Tr>
                                <Td colSpan="5" textAlign="center" py={8}>
                                    <Text color="gray.500" fontSize="lg">
                                        No teams found. Click "Add New Team" to create one.
                                    </Text>
                                </Td>
                            </Tr>
                        ) : (
                            sortedData.map((team) => (
                                <Tr key={team.id}>
                                    <Td>{team.team_number}</Td>
                                    <Td>{team.team_credential}</Td>
                                    <Td>{team.credits}</Td>
                                    <Td>
                                        <Badge colorScheme={team.is_active ? 'green' : 'red'}>
                                            {team.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Button colorScheme='teal' size='sm' onClick={() => handleView(team.id)}>View</Button>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Team Code</Th>
                            <Th>Team Name</Th>
                            <Th>Credits Given</Th>
                            <Th>Password</Th>
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
                                    <Text fontWeight="bold">Team Number:</Text>
                                    <Badge colorScheme="blue">{selectedTeam.team_number}</Badge>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Team Credential:</Text>
                                    <Text>{selectedTeam.team_credential}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Credits:</Text>
                                    <Text color="green.500" fontWeight="semibold">{selectedTeam.credits}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Debit:</Text>
                                    <Text color="red.500" fontWeight="semibold">{selectedTeam.debit}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Status:</Text>
                                    <Badge colorScheme={selectedTeam.is_active ? 'green' : 'red'}>
                                        {selectedTeam.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </HStack>
                                
                                {/* Available Operations Section */}
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
                                    <FormLabel>Team Number</FormLabel>
                                    <Input
                                        type="number"
                                        value={editingTeam.team_number}
                                        onChange={(e) => handleEditChange('team_number', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Team Credential</FormLabel>
                                    <Input
                                        value={editingTeam.team_credential}
                                        onChange={(e) => handleEditChange('team_credential', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Credits</FormLabel>
                                    <Input
                                        type="number"
                                        value={editingTeam.credits}
                                        onChange={(e) => handleEditChange('credits', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Status</FormLabel>
                                    <Input
                                        value={editingTeam.is_active ? 'Active' : 'Inactive'}
                                        onChange={(e) => handleEditChange('is_active', e.target.value === 'Active')}
                                        placeholder="Active or Inactive"
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
                                    <Text><strong>Team Name:</strong> {selectedTeam.team_name}</Text>
                                    <Text><strong>Credits Given:</strong> {selectedTeam.credits}</Text>
                                    <Text><strong>Team Credential:</strong> {selectedTeam.team_credential}</Text>
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
                                <Text mb={1} fontWeight="medium">Team Number</Text>
                                <Input
                                    placeholder="Enter team number"
                                    value={newTeam.team_number}
                                    onChange={(e) => handleNewTeamChange('team_number', e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text mb={1} fontWeight="medium">Credits</Text>
                                <Input
                                    placeholder="Enter credits"
                                    value={newTeam.credits}
                                    onChange={(e) => handleNewTeamChange('credits', e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text mb={1} fontWeight="medium">Team Credential</Text>
                                <Input
                                    placeholder="Enter team credential"
                                    value={newTeam.team_credential}
                                    onChange={(e) => handleNewTeamChange('team_credential', e.target.value)}
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
