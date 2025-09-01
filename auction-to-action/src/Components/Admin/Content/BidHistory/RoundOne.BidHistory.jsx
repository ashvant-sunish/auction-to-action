import React, { useState, useRef } from 'react'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel, Select,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';

function RoundOneBidHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [selectedBid, setSelectedBid] = useState(null);
    const [editingBid, setEditingBid] = useState(null);
    const cancelRef = useRef();

    const [data, setData] = useState([
        { id: 1, item: "001/Item A", amount: "100rs", team: "Team Alpha" },
        { id: 2, item: "002/Item B", amount: "200rs", team: "Team Beta" },
        { id: 3, item: "003/Item C", amount: "300rs", team: "Team Gamma" },
    ]);

    const handleView = (id) => {
        const bid = data.find(item => item.id === id);
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

    const confirmDelete = () => {
        setData(data.filter(item => item.id !== selectedBid.id));
        onDeleteClose();
        setSelectedBid(null);
    };

    const saveEdit = () => {
        setData(data.map(item =>
            item.id === editingBid.id ? editingBid : item
        ));
        onEditClose();
        setEditingBid(null);
    };

    const handleEditChange = (field, value) => {
        setEditingBid(prev => ({
            ...prev,
            [field]: value
        }));
    };


    return (
        <Box>
            <TableContainer>
                <Table variant='striped' colorScheme='teal'>
                    <TableCaption>Real-time Bid History</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Item Code / Name</Th>
                            <Th>Bid Amount</Th>
                            <Th>Given Team</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((bid) => (
                            <Tr key={bid.id}>
                                <Td>{bid.id}</Td>
                                <Td>{bid.item}</Td>
                                <Td>{bid.amount}</Td>
                                <Td>{bid.team}</Td>
                                <Td>
                                    <Button colorScheme='teal' size='sm' onClick={() => handleView(bid.id)}>View</Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Item Code / Name</Th>
                            <Th>Bid Amount</Th>
                            <Th>Given Team</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </TableContainer>

            {/* Modal for Bid Details */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Bid Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedBid && (
                            <VStack align="start" spacing={4}>
                                <HStack>
                                    <Text fontWeight="bold">Bid ID:</Text>
                                    <Badge colorScheme="blue">{selectedBid.id}</Badge>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Item:</Text>
                                    <Text>{selectedBid.item}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Bid Amount:</Text>
                                    <Text color="green.500" fontWeight="semibold">{selectedBid.amount}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Team:</Text>
                                    <Text>{selectedBid.team}</Text>
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
                    <ModalHeader>Edit Bid</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editingBid && (
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Item Code / Name</FormLabel>
                                    <Input
                                        value={editingBid.item}
                                        onChange={(e) => handleEditChange('item', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Bid Amount</FormLabel>
                                    <Input
                                        value={editingBid.amount}
                                        onChange={(e) => handleEditChange('amount', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Team</FormLabel>
                                    <Input
                                        value={editingBid.team}
                                        onChange={(e) => handleEditChange('team', e.target.value)}
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
                            Delete Bid
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete this bid? This action cannot be undone.
                            {selectedBid && (
                                <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                                    <Text><strong>Item:</strong> {selectedBid.item}</Text>
                                    <Text><strong>Amount:</strong> {selectedBid.amount}</Text>
                                    <Text><strong>Team:</strong> {selectedBid.team}</Text>
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
    )
}

export default RoundOneBidHistory
