import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import serverUrl from '../../../../servercon'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel, Select,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Flex, Spacer, useToast, Spinner, Alert, AlertIcon, Textarea
} from '@chakra-ui/react';


function RoundThreeBidHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [editingTrade, setEditingTrade] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [teams, setTeams] = useState([]); // For dropdown options
    const cancelRef = useRef();
    const toast = useToast();

    // Fetch trade history data
    const fetchTradeHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Admin token not found');
            }
            
            const response = await axios.get(`${serverUrl}/api/admin/trade-history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Trade history data:', response.data);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching trade history:', error);
            setError(error.response?.data?.message || 'Failed to fetch trade history');
            toast({
                title: 'Error',
                description: 'Failed to fetch trade history',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch teams for dropdown
    const fetchTeams = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            
            const response = await axios.get(`${serverUrl}/api/admin/teams`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    useEffect(() => {
        fetchTradeHistory();
        fetchTeams();
    }, []);

    const handleView = (id) => {
        const trade = data.find(item => item._id === id);
        setSelectedTrade(trade);
        onOpen();
    };

    const handleEdit = () => {
        setEditingTrade({ ...selectedTrade });
        onClose(); // Close view modal
        onEditOpen(); // Open edit modal
    };

    const handleDelete = () => {
        onClose(); // Close view modal
        onDeleteOpen(); // Open delete confirmation
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            const token = localStorage.getItem('adminToken');
            
            await axios.delete(`${serverUrl}/api/admin/trade-history/${selectedTrade._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast({
                title: 'Success',
                description: 'Trade history deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onDeleteClose();
            setSelectedTrade(null);
            fetchTradeHistory(); // Refresh data
        } catch (error) {
            console.error('Error deleting trade:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete trade history',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeleting(false);
        }
    };

    const saveEdit = async () => {
        try {
            setUpdating(true);
            const token = localStorage.getItem('adminToken');
            
            await axios.put(`${serverUrl}/api/admin/trade-history/${editingTrade._id}`, editingTrade, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            toast({
                title: 'Success',
                description: 'Trade history updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onEditClose();
            setEditingTrade(null);
            fetchTradeHistory(); // Refresh data
        } catch (error) {
            console.error('Error updating trade:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update trade history',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleEditChange = (field, value) => {
        setEditingTrade(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedEditChange = (section, field, value) => {
        setEditingTrade(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleTradeDetailsChange = (field, value) => {
        setEditingTrade(prev => ({
            ...prev,
            tradeDetails: {
                ...prev.tradeDetails,
                [field]: value
            }
        }));
    };

    const formatTradeItems = (items) => {
        if (!items || items.length === 0) return 'None';
        return items.join(', ');
    };

    const handleArrayChange = (field, value) => {
        // Convert comma-separated string to array
        const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        handleTradeDetailsChange(field, array);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Spinner size="lg" />
                <Text ml={3}>Loading trade history...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert status="error">
                <AlertIcon />
                {error}
                <Button ml={3} onClick={fetchTradeHistory}>Retry</Button>
            </Alert>
        );
    }

    return (
        <Box>
            <TableContainer>
                <Table variant='striped' colorScheme='teal'>
                    <TableCaption>Real-time Trade History - Round 3</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Team One</Th>
                            <Th>Team Two</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((trade, index) => (
                            <Tr key={trade._id}>
                                <Td>{index + 1}</Td>
                                <Td>
                                    <Badge colorScheme="green">
                                        {trade.teamOne?.name} ({trade.teamOne?.code})
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge colorScheme="blue">
                                        {trade.teamTwo?.name} ({trade.teamTwo?.code})
                                    </Badge>
                                </Td>
                                <Td>
                                    <Button colorScheme='teal' size='sm' onClick={() => handleView(trade._id)}>View</Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Team One</Th>
                            <Th>Team Two</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </TableContainer>

            {/* Modal for Trade Details */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Trade Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedTrade && (
                            <VStack spacing={6}>
                                <HStack alignSelf="start" w="full">
                                    <Text fontWeight="bold">Trade ID:</Text>
                                    <Badge colorScheme="blue">{selectedTrade._id}</Badge>
                                </HStack>
                                
                                <HStack alignSelf="start" w="full">
                                    <Text fontWeight="bold">Date:</Text>
                                    <Text>{new Date(selectedTrade.createdAt).toLocaleDateString()} at {new Date(selectedTrade.createdAt).toLocaleTimeString()}</Text>
                                </HStack>
                                
                                {/* Trade Visual Layout */}
                                <Box w="full" p={4} bg="gray.50" borderRadius="lg">
                                    <Flex align="center" justify="space-between" w="full">
                                        {/* Team One */}
                                        <Box textAlign="center" flex="1">
                                            <Badge colorScheme="green" fontSize="md" p={2} borderRadius="md">
                                                {selectedTrade.teamOne?.name}
                                            </Badge>
                                            <Text mt={1} fontSize="xs" color="gray.500">({selectedTrade.teamOne?.code})</Text>
                                            <Text mt={2} fontSize="sm" color="gray.600">Giving</Text>
                                            <Box mt={2} p={2} bg="green.50" borderRadius="md">
                                                <Text fontSize="sm"><strong>Items:</strong></Text>
                                                <Text fontSize="sm">{formatTradeItems(selectedTrade.tradeDetails?.teamOneGivesItems)}</Text>
                                                <Text fontSize="sm" mt={1}><strong>Money:</strong> ₹{selectedTrade.tradeDetails?.teamOneGivesMoney || 0}</Text>
                                            </Box>
                                        </Box>

                                        {/* Trade Arrow and Details */}
                                        <Box flex="1" textAlign="center" mx={4}>
                                            <VStack spacing={2}>
                                                <Text fontSize="3xl">⇄</Text>
                                                <Box bg="yellow.100" p={3} borderRadius="md" border="2px dashed" borderColor="yellow.400">
                                                    <Text fontWeight="bold" color="yellow.800">Trade Exchange</Text>
                                                </Box>
                                            </VStack>
                                        </Box>

                                        {/* Team Two */}
                                        <Box textAlign="center" flex="1">
                                            <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="md">
                                                {selectedTrade.teamTwo?.name}
                                            </Badge>
                                            <Text mt={1} fontSize="xs" color="gray.500">({selectedTrade.teamTwo?.code})</Text>
                                            <Text mt={2} fontSize="sm" color="gray.600">Giving</Text>
                                            <Box mt={2} p={2} bg="blue.50" borderRadius="md">
                                                <Text fontSize="sm"><strong>Items:</strong></Text>
                                                <Text fontSize="sm">{formatTradeItems(selectedTrade.tradeDetails?.teamTwoGivesItems)}</Text>
                                                <Text fontSize="sm" mt={1}><strong>Money:</strong> ₹{selectedTrade.tradeDetails?.teamTwoGivesMoney || 0}</Text>
                                            </Box>
                                        </Box>
                                    </Flex>
                                </Box>

                                {/* Trade Summary */}
                                <Box w="full" p={3} bg="blue.50" borderRadius="md">
                                    <Text fontWeight="bold" color="blue.800" mb={2}>Trade Summary</Text>
                                    <VStack spacing={2} align="start">
                                        <Text fontSize="sm">
                                            <strong>{selectedTrade.teamOne?.name}</strong> receives: {formatTradeItems(selectedTrade.tradeDetails?.teamTwoGivesItems)}
                                            {selectedTrade.tradeDetails?.teamTwoGivesMoney > 0 && ` + ₹${selectedTrade.tradeDetails.teamTwoGivesMoney}`}
                                        </Text>
                                        <Text fontSize="sm">
                                            <strong>{selectedTrade.teamTwo?.name}</strong> receives: {formatTradeItems(selectedTrade.tradeDetails?.teamOneGivesItems)}
                                            {selectedTrade.tradeDetails?.teamOneGivesMoney > 0 && ` + ₹${selectedTrade.tradeDetails.teamOneGivesMoney}`}
                                        </Text>
                                    </VStack>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="green" mr={3} onClick={handleEdit}>
                            Edit
                        </Button>
                        <Button colorScheme="red" mr={3} onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Trade</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editingTrade && (
                            <VStack spacing={6}>
                                {/* Teams Selection */}
                                <Flex w="full" gap={4}>
                                    <FormControl flex="1">
                                        <FormLabel>Team One</FormLabel>
                                        <Select
                                            value={editingTrade.teamOne?.code || ''}
                                            onChange={(e) => {
                                                const selectedTeam = teams.find(team => team.teamCode === e.target.value);
                                                if (selectedTeam) {
                                                    handleNestedEditChange('teamOne', 'name', selectedTeam.teamName);
                                                    handleNestedEditChange('teamOne', 'code', selectedTeam.teamCode);
                                                }
                                            }}
                                        >
                                            <option value="">Select Team</option>
                                            {teams.map(team => (
                                                <option key={team._id} value={team.teamCode}>
                                                    {team.teamName} ({team.teamCode})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl flex="1">
                                        <FormLabel>Team Two</FormLabel>
                                        <Select
                                            value={editingTrade.teamTwo?.code || ''}
                                            onChange={(e) => {
                                                const selectedTeam = teams.find(team => team.teamCode === e.target.value);
                                                if (selectedTeam) {
                                                    handleNestedEditChange('teamTwo', 'name', selectedTeam.teamName);
                                                    handleNestedEditChange('teamTwo', 'code', selectedTeam.teamCode);
                                                }
                                            }}
                                        >
                                            <option value="">Select Team</option>
                                            {teams.map(team => (
                                                <option key={team._id} value={team.teamCode}>
                                                    {team.teamName} ({team.teamCode})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Flex>

                                {/* Trade Details for Team One */}
                                <Box w="full" p={4} bg="green.50" borderRadius="lg">
                                    <Text fontWeight="bold" mb={3} color="green.700">
                                        {editingTrade.teamOne?.name || 'Team One'} Gives:
                                    </Text>
                                    <Flex gap={4}>
                                        <FormControl flex="2">
                                            <FormLabel>Items (comma-separated)</FormLabel>
                                            <Textarea
                                                value={editingTrade.tradeDetails?.teamOneGivesItems?.join(', ') || ''}
                                                onChange={(e) => handleArrayChange('teamOneGivesItems', e.target.value)}
                                                placeholder="e.g., Property A, Goods B, Resource C"
                                                rows={2}
                                            />
                                        </FormControl>
                                        <FormControl flex="1">
                                            <FormLabel>Money Amount (₹)</FormLabel>
                                            <Input
                                                type="number"
                                                value={editingTrade.tradeDetails?.teamOneGivesMoney || 0}
                                                onChange={(e) => handleTradeDetailsChange('teamOneGivesMoney', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </FormControl>
                                    </Flex>
                                </Box>

                                {/* Trade Details for Team Two */}
                                <Box w="full" p={4} bg="blue.50" borderRadius="lg">
                                    <Text fontWeight="bold" mb={3} color="blue.700">
                                        {editingTrade.teamTwo?.name || 'Team Two'} Gives:
                                    </Text>
                                    <Flex gap={4}>
                                        <FormControl flex="2">
                                            <FormLabel>Items (comma-separated)</FormLabel>
                                            <Textarea
                                                value={editingTrade.tradeDetails?.teamTwoGivesItems?.join(', ') || ''}
                                                onChange={(e) => handleArrayChange('teamTwoGivesItems', e.target.value)}
                                                placeholder="e.g., Property X, Goods Y, Resource Z"
                                                rows={2}
                                            />
                                        </FormControl>
                                        <FormControl flex="1">
                                            <FormLabel>Money Amount (₹)</FormLabel>
                                            <Input
                                                type="number"
                                                value={editingTrade.tradeDetails?.teamTwoGivesMoney || 0}
                                                onChange={(e) => handleTradeDetailsChange('teamTwoGivesMoney', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </FormControl>
                                    </Flex>
                                </Box>

                                {/* Preview */}
                                <Box w="full" p={3} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
                                    <Text fontWeight="bold" color="yellow.800" mb={2}>Trade Preview</Text>
                                    <VStack spacing={1} align="start">
                                        <Text fontSize="sm" color="yellow.700">
                                            <strong>{editingTrade.teamOne?.name || 'Team One'}</strong> gives: {formatTradeItems(editingTrade.tradeDetails?.teamOneGivesItems)} + ₹{editingTrade.tradeDetails?.teamOneGivesMoney || 0}
                                        </Text>
                                        <Text fontSize="sm" color="yellow.700">
                                            <strong>{editingTrade.teamTwo?.name || 'Team Two'}</strong> gives: {formatTradeItems(editingTrade.tradeDetails?.teamTwoGivesItems)} + ₹{editingTrade.tradeDetails?.teamTwoGivesMoney || 0}
                                        </Text>
                                    </VStack>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            colorScheme="blue" 
                            mr={3} 
                            onClick={saveEdit}
                            isLoading={updating}
                            loadingText="Saving..."
                        >
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
                            Delete Trade
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete this trade? This action cannot be undone.
                            {selectedTrade && (
                                <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                                    <Text><strong>Trade:</strong> {selectedTrade.teamOne?.name} ↔ {selectedTrade.teamTwo?.name}</Text>
                                    <Text><strong>Items:</strong> {formatTradeItems(selectedTrade.tradeDetails?.teamOneGivesItems)} ↔ {formatTradeItems(selectedTrade.tradeDetails?.teamTwoGivesItems)}</Text>
                                    <Text><strong>Money:</strong> ₹{selectedTrade.tradeDetails?.teamOneGivesMoney || 0} ↔ ₹{selectedTrade.tradeDetails?.teamTwoGivesMoney || 0}</Text>
                                </Box>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="red" 
                                onClick={confirmDelete} 
                                ml={3}
                                isLoading={deleting}
                                loadingText="Deleting..."
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

        </Box>
    )
}

export default RoundThreeBidHistory
