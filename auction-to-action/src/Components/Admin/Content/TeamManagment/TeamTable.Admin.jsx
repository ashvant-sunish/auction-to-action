import React, { useState, useRef } from 'react'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Flex, 
} from '@chakra-ui/react';
import { IoIosAdd } from "react-icons/io";
import { GoTriangleUp,GoTriangleDown } from "react-icons/go";

function TeamTableAdmin() {
  const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [editingTeam, setEditingTeam] = useState(null);
    const [newTeam, setNewTeam] = useState({ team_name: '', credits: '', password: '' });
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const cancelRef = useRef();

    const [data, setData] = useState([
        { id: 1, team_name: "Team 1/001", credits: "10000rs", password: "24bmf0512" },
        { id: 2, team_name: "Team 2/002", credits: "20000rs", password: "24gfs0123" },
        { id: 3, team_name: "Team 3/003", credits: "35672rs", password: "24hgf0456" },
    ]);

    const handleView = (id) => {
        const team = data.find(team => team.id === id);
        setSelectedTeam(team);
        onOpen();
    };

    const handleEdit = () => {
        setEditingTeam({ ...selectedTeam });
        onClose(); // Close view modal
        onEditOpen(); // Open edit modal
    };

    const handleDelete = () => {
        onClose(); // Close view modal
        onDeleteOpen(); // Open delete confirmation
    };

    const confirmDelete = () => {
        setData(data.filter(team => team.id !== selectedTeam.id));
        onDeleteClose();
        setSelectedTeam(null);
    };

    const saveEdit = () => {
        setData(data.map(team =>
            team.id === editingTeam.id ? editingTeam : team
        ));
        onEditClose();
        setEditingTeam(null);
    };

    const handleEditChange = (field, value) => {
        setEditingTeam(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddTeam = () => {
        const newId = Math.max(...data.map(team => team.id)) + 1;
        setData([...data, { ...newTeam, id: newId }]);
        setNewTeam({ team_name: '', credits: '', password: '' });
        onAddClose();
    };

    const handleNewTeamChange = (field, value) => {
        setNewTeam(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedData = [...data].sort((a, b) => {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
    });


    return (
        <Box bg="white" p={4} mt={2} borderRadius="md">
            {/* Add New Team Button */}
            <Flex mb={4} justify="flex-end">
                <Button 
                    leftIcon={<IoIosAdd />} 
                    colorScheme="blue" 
                    onClick={onAddOpen}
                    size="sm"
                >
                    Add New Team
                </Button>
            </Flex>

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
                                    <Text>Sl No</Text>
                                    {sortOrder === 'asc' ? <GoTriangleUp /> : <GoTriangleDown />}
                                </HStack>
                            </Th>
                            <Th>Team Code / Name</Th>
                            <Th>Credits Given</Th>
                            <Th>Password</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedData.map((team) => (
                            <Tr key={team.id}>
                                <Td>{team.id}</Td>
                                <Td>{team.team_name}</Td>
                                <Td>{team.credits}</Td>
                                <Td>{team.password}</Td>
                                <Td>
                                    <Button colorScheme='teal' size='sm' onClick={() => handleView(team.id)}>View</Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Sl No</Th>
                            <Th>Team Code / Name</Th>
                            <Th>Credits Given</Th>
                            <Th>Password</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </TableContainer>

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
                                    <Text fontWeight="bold">Team ID:</Text>
                                    <Badge colorScheme="blue">{selectedTeam.id}</Badge>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Team Name:</Text>
                                    <Text>{selectedTeam.team_name}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Credits Given:</Text>
                                    <Text color="green.500" fontWeight="semibold">{selectedTeam.credits}</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold">Password:</Text>
                                    <Text>{selectedTeam.password}</Text>
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
                    <ModalHeader>Edit Team</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editingTeam && (
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Team Name / Code</FormLabel>
                                    <Input
                                        value={editingTeam.team_name}
                                        onChange={(e) => handleEditChange('team_name', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Credits Given</FormLabel>
                                    <Input
                                        value={editingTeam.credits}
                                        onChange={(e) => handleEditChange('credits', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        value={editingTeam.password}
                                        onChange={(e) => handleEditChange('password', e.target.value)}
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
                                    <Text><strong>Password:</strong> {selectedTeam.password}</Text>
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
                                <Text mb={1} fontWeight="medium">Team Name</Text>
                                <Input
                                    placeholder="Enter team name"
                                    value={newTeam.team_name}
                                    onChange={(e) => handleNewTeamChange('team_name', e.target.value)}
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
                                <Text mb={1} fontWeight="medium">Password</Text>
                                <Input
                                    placeholder="Enter password"
                                    value={newTeam.password}
                                    onChange={(e) => handleNewTeamChange('password', e.target.value)}
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
