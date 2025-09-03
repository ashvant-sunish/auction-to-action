import React, { useState, useRef } from 'react'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel, Select,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Flex,
    Spacer
} from '@chakra-ui/react';


function RoundThreeBidHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [selectedBid, setSelectedBid] = useState(null);
    const [editingBid, setEditingBid] = useState(null);
    const cancelRef = useRef();

    const [data, setData] = useState([
            { id: 1, team_one: "Team Alpha", team_two: "Team Delta", team_one_itemstraded: "4x Property",team_one_moneytraded: "4000", team_two_itemstraded: "20x Goods", team_two_moneytraded: "0"  },
            { id: 2, team_one: "Team Beta", team_two: "Team Epsilon", team_one_itemstraded: "10x Items", team_one_moneytraded: "2000", team_two_itemstraded: "40x Property", team_two_moneytraded: "0" },
            { id: 3, team_one: "Team Gamma", team_two: "Team Zeta", team_one_itemstraded: "15x Goods", team_one_moneytraded: "0", team_two_itemstraded: "0", team_two_moneytraded: "20000" },
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
                            <Th>Trade Team One</Th>
                            <Th>Trade Team Two</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((bid) => (
                            <Tr key={bid.id}>
                                <Td>{bid.id}</Td>
                                <Td>{bid.team_one}</Td>
                                <Td>{bid.team_two}</Td>
                                <Td>
                                    <Button colorScheme='teal' size='sm' onClick={() => handleView(bid.id)}>View</Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Trade Team One</Th>
                            <Th>Trade Team Two</Th>
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
                            <VStack spacing={6}>
                                <HStack alignSelf="start" w="full">
                                    <Text fontWeight="bold">Trade ID:</Text>
                                    <Badge colorScheme="blue">{selectedBid.id}</Badge>
                                </HStack>
                                
                                {/* Trade Visual Layout */}
                                <Box w="full" p={4} bg="gray.50" borderRadius="lg">
                                    <Flex align="center" justify="space-between" w="full">
                                        {/* Team One */}
                                        <Box textAlign="center" flex="1">
                                            <Badge colorScheme="green" fontSize="md" p={2} borderRadius="md">
                                                {selectedBid.team_one}
                                            </Badge>
                                            <Text mt={2} fontSize="sm" color="gray.600">Giving</Text>
                                            <Text mt={2} fontSize="sm"><strong>Item:</strong> {selectedBid.team_one_itemstraded}</Text>
                                            <Text mt={2} fontSize="sm"><strong>Money:</strong> {selectedBid.team_one_moneytraded}</Text>
                                        </Box>

                                        {/* Trade Arrow and Details */}
                                        <Box flex="1" textAlign="center" mx={4}>
                                            <VStack spacing={2}>
                                                <Text fontSize="2xl">⇄</Text>
                                                <Box bg="yellow.100" p={3} borderRadius="md" border="2px dashed" borderColor="yellow.400">
                                                    <Text fontWeight="bold" color="yellow.800">Trade Details</Text>
                                                </Box>
                                            </VStack>
                                        </Box>

                                        {/* Team Two */}
                                        <Box textAlign="center" flex="1">
                                            <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="md">
                                                {selectedBid.team_two}
                                            </Badge>
                                            <Text mt={2} fontSize="sm" color="gray.600">Returning</Text>
                                            <Text mt={2} fontSize="sm"><strong>Item:</strong> {selectedBid.team_two_itemstraded}</Text>
                                            <Text mt={2} fontSize="sm"><strong>Money:</strong> {selectedBid.team_two_moneytraded}</Text>

                                        </Box>
                                    </Flex>
                                </Box>

                                {/* Additional Details */}
                                <Box w="full" p={3} bg="blue.50" borderRadius="md">
                                    <Text fontWeight="bold" color="blue.800" mb={2}>Trade Summary</Text>
                                    <HStack justify="space-between">
                                        <Text fontSize="sm">
                                            <strong>{selectedBid.team_one}</strong> receives {selectedBid.team_two_itemstraded}
                                            {' + ' + selectedBid.team_two_moneytraded + ' rs'}
                                        </Text>
                                        <Text fontSize="lg">→</Text>
                                        <Text fontSize="sm">
                                            <strong>{selectedBid.team_two}</strong> receives {selectedBid.team_one_itemstraded}
                                            {' + ' + selectedBid.team_one_moneytraded + ' rs'}
                                        </Text>
                                    </HStack>
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
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Bid</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editingBid && (
                            <VStack spacing={6}>
                                {/* Teams Selection */}
                                <Flex w="full" gap={4}>
                                    <FormControl flex="1">
                                        <FormLabel>Team One (Giving)</FormLabel>
                                        <Select
                                            value={editingBid.team_one || ''}
                                            onChange={(e) => handleEditChange('team_one', e.target.value)}
                                        >
                                            <option value="">Select Team</option>
                                            <option value="Team Alpha">Team Alpha</option>
                                            <option value="Team Beta">Team Beta</option>
                                            <option value="Team Gamma">Team Gamma</option>
                                            <option value="Team Delta">Team Delta</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl flex="1">
                                        <FormLabel>Team Two (Receiving)</FormLabel>
                                        <Select
                                            value={editingBid.team_two || ''}
                                            onChange={(e) => handleEditChange('team_two', e.target.value)}
                                        >
                                            <option value="">Select Team</option>
                                            <option value="Team Alpha">Team Alpha</option>
                                            <option value="Team Beta">Team Beta</option>
                                            <option value="Team Gamma">Team Gamma</option>
                                            <option value="Team Delta">Team Delta</option>
                                        </Select>
                                    </FormControl>
                                </Flex>

                                {/* Trade Type */}
                                <FormControl>
                                    <FormLabel>Trade Type</FormLabel>
                                    <Select
                                        value={editingBid.trade_type || ''}
                                        onChange={(e) => handleEditChange('trade_type', e.target.value)}
                                    >
                                        <option value="">Select Trade Type</option>
                                        <option value="player_for_money">Player for Money</option>
                                        <option value="player_for_player">Player for Player</option>
                                        <option value="money_only">Money Only</option>
                                        <option value="mixed_trade">Mixed Trade</option>
                                    </Select>
                                </FormControl>

                                {/* Trade Details */}
                                <Box w="full" p={4} bg="gray.50" borderRadius="lg">
                                    <Text fontWeight="bold" mb={3} color="gray.700">Trade Details</Text>
                                    <Flex gap={4}>
                                        <FormControl flex="1">
                                            <FormLabel>Item/Player Being Traded</FormLabel>
                                            <Input
                                                value={editingBid.item_traded || ''}
                                                onChange={(e) => handleEditChange('item_traded', e.target.value)}
                                                placeholder="e.g., Player Smith"
                                            />
                                        </FormControl>
                                        <FormControl flex="1">
                                            <FormLabel>Money Amount</FormLabel>
                                            <Input
                                                value={editingBid.money_traded || ''}
                                                onChange={(e) => handleEditChange('money_traded', e.target.value)}
                                                placeholder="e.g., 50rs"
                                            />
                                        </FormControl>
                                    </Flex>
                                    <FormControl mt={3}>
                                        <FormLabel>Item/Player Received (if applicable)</FormLabel>
                                        <Input
                                            value={editingBid.item_received || ''}
                                            onChange={(e) => handleEditChange('item_received', e.target.value)}
                                            placeholder="e.g., Player Wilson (for player-to-player trades)"
                                        />
                                    </FormControl>
                                </Box>

                                {/* Preview */}
                                <Box w="full" p={3} bg="blue.50" borderRadius="md">
                                    <Text fontWeight="bold" color="blue.800" mb={2}>Trade Preview</Text>
                                    <Text fontSize="sm" color="blue.600">
                                        <strong>{editingBid.team_one || 'Team One'}</strong> → 
                                        {editingBid.item_traded && ` ${editingBid.item_traded}`}
                                        {editingBid.money_traded && editingBid.money_traded !== "0rs" && ` + ${editingBid.money_traded}`} → 
                                        <strong> {editingBid.team_two || 'Team Two'}</strong>
                                        {editingBid.item_received && ` (receives ${editingBid.item_received})`}
                                    </Text>
                                </Box>
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
                                    <Text><strong>Trade:</strong> {selectedBid.team_one} ↔ {selectedBid.team_two}</Text>
                                    <Text><strong>Item:</strong> {selectedBid.item_traded}</Text>
                                    <Text><strong>Money:</strong> {selectedBid.money_traded}</Text>
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

export default RoundThreeBidHistory
