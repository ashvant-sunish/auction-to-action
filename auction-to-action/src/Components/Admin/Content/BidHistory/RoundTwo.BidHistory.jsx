import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import serverUrl from '../../../../servercon';

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel, Select,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Spinner, Center, Alert, AlertIcon
} from '@chakra-ui/react';

function RoundTwoBidHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [selectedBid, setSelectedBid] = useState(null);
    const [editingBid, setEditingBid] = useState(null);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const cancelRef = useRef();

    // Fetch Round 2 bid history on component mount
    useEffect(() => {
        fetchBidHistory();
    }, []);

    const fetchBidHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                setError('No admin token found. Please login again.');
                setIsLoading(false);
                return;
            }

            // Fetch Round 2 bid history specifically
            const response = await axios.get(`${serverUrl}/api/admin/bid-history?round=2`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('🔍 Round 2 API Response:', response.data);
            console.log('🔍 Round 2 Data Length:', response.data?.length);
            
            // Log each bid's round number for debugging
            response.data?.forEach((bid, index) => {
                console.log(`Bid ${index + 1}: Round ${bid.round}, Mystery Box: ${bid.mysteryBoxReward}`);
            });

            setData(response.data || []);
        } catch (err) {
            console.error('Error fetching bid history:', err);
            setError('Failed to fetch bid history. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (bidId) => {
        const bid = data.find(item => item._id === bidId);
        setSelectedBid(bid);
        onOpen();
    };

    const handleEdit = () => {
        setEditingBid({ ...selectedBid });
        onClose(); // Close view modal
        onEditOpen(); // Open edit modal
    };

    const handleDelete = () => {
        onClose(); // Close view modal
        onDeleteOpen(); // Open delete confirmation
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                setError('No admin token found. Please login again.');
                return;
            }

            // Call API to delete bid history
            await axios.delete(`${serverUrl}/api/admin/bid-history/${selectedBid._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state to remove deleted item
            setData(data.filter(item => item._id !== selectedBid._id));
            onDeleteClose();
            setSelectedBid(null);
            
            console.log('✅ Bid history deleted successfully');
        } catch (err) {
            console.error('❌ Error deleting bid history:', err);
            setError('Failed to delete bid history. Please try again.');
        }
    };

    const saveEdit = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                setError('No admin token found. Please login again.');
                return;
            }

            // Call API to update bid history
            const response = await axios.put(`${serverUrl}/api/admin/bid-history/${editingBid._id}`, {
                mysteryBoxReward: editingBid.mysteryBoxReward,
                rewardType: editingBid.rewardType,
                bidAmount: editingBid.bidAmount,
                teamName: editingBid.teamName,
                teamCode: editingBid.teamCode,
                cashReward: editingBid.cashReward,
                deductionAmount: editingBid.deductionAmount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state with the updated item
            setData(data.map(item =>
                item._id === editingBid._id ? { ...item, ...editingBid } : item
            ));
            
            onEditClose();
            setEditingBid(null);
            
            console.log('✅ Bid history updated successfully:', response.data);
        } catch (err) {
            console.error('❌ Error updating bid history:', err);
            setError('Failed to update bid history. Please try again.');
        }
    };

    const handleEditChange = (field, value) => {
        setEditingBid(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Loading state
    if (isLoading) {
        return (
            <Center py={10}>
                <Spinner size="xl" color="teal.500" />
                <Text ml={4}>Loading Round 2 bid history...</Text>
            </Center>
        );
    }

    // Error state
    if (error) {
        return (
            <Alert status="error" mx={4}>
                <AlertIcon />
                {error}
                <Button ml={4} size="sm" onClick={fetchBidHistory}>
                    Retry
                </Button>
            </Alert>
        );
    }

    return (
        <Box>
            <TableContainer>
                <Table variant='striped' colorScheme='teal'>
                    <TableCaption>Round 2 Bid History - Real-time Data</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Mystery Box Reward</Th>
                            <Th>Bid Amount</Th>
                            <Th>Team</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.length === 0 ? (
                            <Tr>
                                <Td colSpan={5} textAlign="center">
                                    <Text color="gray.500">No bid history found for Round 2</Text>
                                </Td>
                            </Tr>
                        ) : (
                            data.map((bid, index) => (
                                <Tr key={bid._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{bid.mysteryBoxReward || 'N/A'}</Td>
                                    <Td>₹{bid.bidAmount || 'N/A'}</Td>
                                    <Td>{bid.teamName || bid.teamCode || 'N/A'}</Td>
                                    <Td>
                                        <Button colorScheme='teal' size='sm' onClick={() => handleView(bid._id)}>
                                            View
                                        </Button>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Mystery Box Reward</Th>
                            <Th>Bid Amount</Th>
                            <Th>Team</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </TableContainer>

            {/* Modal for Bid Details */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Round 2 Bid Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedBid && (
                            <VStack align="start" spacing={4}>
                                <HStack>
                                    <Text fontWeight="bold">Bid ID:</Text>
                                    <Badge colorScheme="blue">{selectedBid._id}</Badge>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Round:</Text>
                                    <Badge colorScheme="purple">{selectedBid.round}</Badge>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Mystery Box Reward:</Text>
                                    <Text>{selectedBid.mysteryBoxReward || 'N/A'}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Reward Type:</Text>
                                    <Badge colorScheme={
                                        selectedBid.rewardType === 'cash' ? 'green' :
                                        selectedBid.rewardType === 'resources' ? 'blue' :
                                        selectedBid.rewardType === 'challenge' ? 'orange' :
                                        'gray'
                                    }>
                                        {selectedBid.rewardType || 'N/A'}
                                    </Badge>
                                </HStack>
                                {selectedBid.cashReward > 0 && (
                                    <HStack>
                                        <Text fontWeight="bold">Cash Reward:</Text>
                                        <Text color="green.500" fontWeight="semibold">₹{selectedBid.cashReward}</Text>
                                    </HStack>
                                )}
                                {selectedBid.deductionAmount > 0 && (
                                    <HStack>
                                        <Text fontWeight="bold">Deduction Amount:</Text>
                                        <Text color="red.500" fontWeight="semibold">₹{selectedBid.deductionAmount}</Text>
                                    </HStack>
                                )}
                                {selectedBid.resourcesGained && Object.keys(selectedBid.resourcesGained).length > 0 && (
                                    <VStack align="start">
                                        <Text fontWeight="bold">Resources Gained:</Text>
                                        <Box pl={4}>
                                            {Object.entries(selectedBid.resourcesGained).map(([resource, amount]) => (
                                                <Text key={resource}>
                                                    {resource}: {amount}
                                                </Text>
                                            ))}
                                        </Box>
                                    </VStack>
                                )}
                                <HStack>
                                    <Text fontWeight="bold">Bid Amount:</Text>
                                    <Text color="green.500" fontWeight="semibold">₹{selectedBid.bidAmount || 'N/A'}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Team Code:</Text>
                                    <Text>{selectedBid.teamCode || 'N/A'}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Team Name:</Text>
                                    <Text>{selectedBid.teamName || 'N/A'}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Created At:</Text>
                                    <Text>{selectedBid.createdAt ? new Date(selectedBid.createdAt).toLocaleString() : 'N/A'}</Text>
                                </HStack>
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
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Round 2 Bid</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editingBid && (
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Mystery Box Reward</FormLabel>
                                    <Input
                                        value={editingBid.mysteryBoxReward || ''}
                                        onChange={(e) => handleEditChange('mysteryBoxReward', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Reward Type</FormLabel>
                                    <Select
                                        value={editingBid.rewardType || ''}
                                        onChange={(e) => handleEditChange('rewardType', e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="cash">Cash</option>
                                        <option value="resources">Resources</option>
                                        <option value="challenge">Challenge</option>
                                        <option value="nothing">Nothing</option>
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Bid Amount</FormLabel>
                                    <Input
                                        type="number"
                                        value={editingBid.bidAmount || ''}
                                        onChange={(e) => handleEditChange('bidAmount', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Cash Reward</FormLabel>
                                    <Input
                                        type="number"
                                        value={editingBid.cashReward || ''}
                                        onChange={(e) => handleEditChange('cashReward', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Deduction Amount</FormLabel>
                                    <Input
                                        type="number"
                                        value={editingBid.deductionAmount || ''}
                                        onChange={(e) => handleEditChange('deductionAmount', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Team Name</FormLabel>
                                    <Input
                                        value={editingBid.teamName || ''}
                                        onChange={(e) => handleEditChange('teamName', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Team Code</FormLabel>
                                    <Input
                                        value={editingBid.teamCode || ''}
                                        onChange={(e) => handleEditChange('teamCode', e.target.value)}
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
                            Delete Round 2 Bid
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete this bid? This action cannot be undone.
                            {selectedBid && (
                                <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                                    <Text><strong>Mystery Box:</strong> {selectedBid.mysteryBoxReward}</Text>
                                    <Text><strong>Amount:</strong> ₹{selectedBid.bidAmount}</Text>
                                    <Text><strong>Team:</strong> {selectedBid.teamName}</Text>
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
        </Box>
    );
}

export default RoundTwoBidHistory
