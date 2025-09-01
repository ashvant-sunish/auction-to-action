import React, { useState, useRef } from 'react'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Flex
} from '@chakra-ui/react';
import { IoIosAdd } from "react-icons/io";
import { GoTriangleUp,GoTriangleDown } from "react-icons/go";

function AdminTableAdmin() {
  const { isOpen, onOpen, onClose } = useDisclosure();
      const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
      const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
      const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
      const [selectedAdmin, setSelectedAdmin] = useState(null);
      const [editingAdmin, setEditingAdmin] = useState(null);
      const [newAdmin, setNewAdmin] = useState({ name: '', password: '' });
      const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
      const cancelRef = useRef();
  
      const [data, setData] = useState([
          { id: 1, name: "Ashvant",  password: "admin1234" },
          { id: 2, name: "Admin 2", password: "24gfs0123" },
          { id: 3, name: "Admin 3", password: "24hgf0456" },
      ]);
  
      const handleView = (id) => {
          const admin = data.find(admin => admin.id === id);
          setSelectedAdmin(admin);
          onOpen();
      };
  
      const handleEdit = () => {
          setEditingAdmin({ ...selectedAdmin });
          onClose(); // Close view modal
          onEditOpen(); // Open edit modal
      };
  
      const handleDelete = () => {
          onClose(); // Close view modal
          onDeleteOpen(); // Open delete confirmation
      };
  
      const confirmDelete = () => {
          setData(data.filter(admin => admin.id !== selectedAdmin.id));
          onDeleteClose();
          setSelectedAdmin(null);
      };
  
      const saveEdit = () => {
          setData(data.map(admin =>
              admin.id === editingAdmin.id ? editingAdmin : admin
          ));
          onEditClose();
          setEditingAdmin(null);
      };
  
      const handleEditChange = (field, value) => {
          setEditingAdmin(prev => ({
              ...prev,
              [field]: value
          }));
      };

      const handleAddAdmin = () => {
          const newId = Math.max(...data.map(admin => admin.id)) + 1;
          setData([...data, { ...newAdmin, id: newId }]);
          setNewAdmin({ name: '', password: '' });
          onAddClose();
      };

      const handleNewAdminChange = (field, value) => {
          setNewAdmin(prev => ({
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
              {/* Add New Admin Button */}
              <Flex mb={4} justify="flex-end">
                  <Button 
                      leftIcon={<IoIosAdd />} 
                      colorScheme="blue" 
                      onClick={onAddOpen}
                      size="sm"
                  >
                      Add New Admin
                  </Button>
              </Flex>
  
              <TableContainer>
                  <Table variant='striped' colorScheme='teal'>
                      <TableCaption>Admin Management Table</TableCaption>
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
                              <Th>Admin Name</Th>
                              <Th>Password</Th>
                              <Th>Action</Th>
                          </Tr>
                      </Thead>
                      <Tbody>
                          {sortedData.map((admin) => (
                              <Tr key={admin.id}>
                                  <Td>{admin.id}</Td>
                                  <Td>{admin.name}</Td>
                                  <Td>{admin.password}</Td>
                                  <Td>
                                      <Button colorScheme='teal' size='sm' onClick={() => handleView(admin.id)}>View</Button>
                                  </Td>
                              </Tr>
                          ))}
                      </Tbody>
                      <Tfoot>
                          <Tr>
                              <Th>Sl No</Th>
                              <Th>Admin Name</Th>
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
                          {selectedAdmin && (
                              <VStack align="start" spacing={4}>
                                  <HStack>
                                      <Text fontWeight="bold">Admin ID:</Text>
                                      <Badge colorScheme="blue">{selectedAdmin.id}</Badge>
                                  </HStack>
                                  <HStack>
                                      <Text fontWeight="bold">Admin Name:</Text>
                                      <Text>{selectedAdmin.name}</Text>
                                  </HStack>
                                  <HStack>
                                      <Text fontWeight="bold">Password:</Text>
                                      <Text>{selectedAdmin.password}</Text>
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
                          {editingAdmin && (
                              <VStack spacing={4}>
                                  <FormControl>
                                      <FormLabel>Admin Name</FormLabel>
                                      <Input
                                          value={editingAdmin.name}
                                          onChange={(e) => handleEditChange('name', e.target.value)}
                                      />
                                  </FormControl>
                                  <FormControl>
                                      <FormLabel>Password</FormLabel>
                                      <Input
                                          value={editingAdmin.password}
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
                              {selectedAdmin && (
                                  <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                                      <Text><strong>Admin Name:</strong> {selectedAdmin.name}</Text>
                                      <Text><strong>Password:</strong> {selectedAdmin.password}</Text>
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
                                      placeholder="Enter admin name"
                                      value={newAdmin.name}
                                      onChange={(e) => handleNewAdminChange('name', e.target.value)}
                                  />
                              </Box>
                              <Box>
                                  <Text mb={1} fontWeight="medium">Credits</Text>
                                  <Input
                                      placeholder="Enter credits"
                                      value={newAdmin.credits}
                                      onChange={(e) => handleNewAdminChange('credits', e.target.value)}
                                  />
                              </Box>
                              <Box>
                                  <Text mb={1} fontWeight="medium">Password</Text>
                                  <Input
                                      placeholder="Enter password"
                                      value={newAdmin.password}
                                      onChange={(e) => handleNewAdminChange('password', e.target.value)}
                                  />
                              </Box>
                          </VStack>
                      </ModalBody>
                      <ModalFooter>
                          <Button variant="ghost" mr={3} onClick={onAddClose}>
                              Cancel
                          </Button>
                          <Button colorScheme="blue" onClick={handleAddAdmin}>
                              Add Admin
                          </Button>
                      </ModalFooter>
                  </ModalContent>
              </Modal>
  
          </Box>
      )
}

export default AdminTableAdmin
