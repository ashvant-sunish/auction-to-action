import React, { useState, useRef, useEffect } from 'react'

import {
    Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Text, VStack, HStack, Badge, useDisclosure, Input, FormControl, FormLabel,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Flex, Spinner, Center
} from '@chakra-ui/react';
import { IoIosAdd } from "react-icons/io";
import { GoTriangleUp,GoTriangleDown } from "react-icons/go";
import axios from 'axios';
import serverUrl from '../../../../servercon';

function AdminTableAdmin() {
  const { isOpen, onOpen, onClose } = useDisclosure();
      const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
      const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
      const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
      const [selectedAdmin, setSelectedAdmin] = useState(null);
      const [editingAdmin, setEditingAdmin] = useState(null);
      const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'admin' });
      const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
      const cancelRef = useRef();
  
    const [data, setData] = useState([]); // Start with empty array to show only database data
    const [isLoading, setIsLoading] = useState(true);

    // Fetch admins data from backend on component mount
    useEffect(() => {
        fetchAdminsData();
    }, []);

    const fetchAdminsData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${serverUrl}/api/admin/admins`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Handle different possible response structures
            let adminsArray = [];
            if (Array.isArray(response.data)) {
                // Response is directly an array of admins
                adminsArray = response.data;
            } else if (response.data && response.data.admins && Array.isArray(response.data.admins)) {
                // Response has admins property
                adminsArray = response.data.admins;
            }

            setData(adminsArray);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (adminId) => {
        const admin = data.find(admin => admin._id === adminId || admin.id === adminId);
        
        if (admin) {
            // Convert to display format for modal
            const displayAdmin = {
                id: admin._id || admin.id,
                username: admin.username,
                role: admin.role || 'admin',
                original: admin
            };
            setSelectedAdmin(displayAdmin);
            onOpen();
        }
    };
  
    const handleEdit = () => {
        setEditingAdmin({ ...selectedAdmin });
        onClose(); // Close view modal
        onEditOpen(); // Open edit modal
    };      const handleDelete = () => {
          onClose(); // Close view modal
          onDeleteOpen(); // Open delete confirmation
      };
  
    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (token && selectedAdmin.id) {
                await axios.delete(`${serverUrl}/api/admin/admins/${selectedAdmin.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
        }
        
        // Refresh data from backend
        await fetchAdminsData();
        onDeleteClose();
        setSelectedAdmin(null);
    };

    const saveEdit = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (token && editingAdmin.id) {
                const updateData = {
                    username: editingAdmin.username,
                    role: editingAdmin.role
                };
                
                await axios.put(`${serverUrl}/api/admin/admins/${editingAdmin.id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Error updating admin:', error);
        }
        
        // Refresh data from backend
        await fetchAdminsData();
        onEditClose();
        setEditingAdmin(null);
    };
  
    const handleEditChange = (field, value) => {
        setEditingAdmin(prev => ({
            ...prev,
            [field]: value
        }));
    };    const handleAddAdmin = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (token) {
                const addData = {
                    username: newAdmin.username,
                    password: newAdmin.password,
                    role: newAdmin.role || 'admin'
                };
                
                await axios.post(`${serverUrl}/api/admin/admins`, addData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Error adding admin:', error);
        }
        
        // Refresh data from backend
        await fetchAdminsData();
        setNewAdmin({ username: '', password: '', role: 'admin' });
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

    // Create display data with proper mapping
    const displayAdmins = data.map((admin, index) => {
        const displayAdmin = {
            id: admin._id || admin.id || (index + 1),
            serialNo: index + 1, // Add serial number
            username: admin.username || `Admin ${index + 1}`,
            role: admin.role || 'admin',
            original: admin // Keep reference to original for operations
        };
        return displayAdmin;
    });

    const sortedData = [...displayAdmins].sort((a, b) => {
        const aSerial = a.serialNo;
        const bSerial = b.serialNo;
        return sortOrder === 'asc' ? aSerial - bSerial : bSerial - aSerial;
    });
  
  
      return (
          <Box bg="white" p={4} mt={2} mb={2}borderRadius="md">
              {/* Add New Admin Button */}
              <Flex mb={4} justify="space-between" align="center">
                  <Button 
                      size="sm"
                      colorScheme="gray"
                      onClick={fetchAdminsData}
                      isLoading={isLoading}
                  >
                      Refresh Data
                  </Button>
                  <Button 
                      leftIcon={<IoIosAdd />} 
                      colorScheme="blue" 
                      onClick={onAddOpen}
                      size="sm"
                  >
                      Add New Admin
                  </Button>
              </Flex>

              {isLoading ? (
                  <Center py={10}>
                      <Spinner size="xl" />
                      <Text ml={3}>Loading admins...</Text>
                  </Center>
              ) : (
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
                                  <Th>Username</Th>
                                  <Th>Role</Th>
                                  <Th>Action</Th>
                              </Tr>
                          </Thead>
                          <Tbody>
                              {sortedData.length === 0 ? (
                                  <Tr>
                                      <Td colSpan="4" textAlign="center" py={8}>
                                          <Text color="gray.500" fontSize="lg">
                                              No admins found. Click "Add New Admin" to create one.
                                          </Text>
                                      </Td>
                                  </Tr>
                              ) : (
                                  sortedData.map((admin) => (
                                      <Tr key={admin.id}>
                                          <Td>{admin.serialNo}</Td>
                                          <Td>{admin.username}</Td>
                                          <Td>
                                              <Badge colorScheme="blue">
                                                  {admin.role}
                                              </Badge>
                                          </Td>
                                          <Td>
                                              <Button colorScheme='teal' size='sm' onClick={() => handleView(admin.id)}>View</Button>
                                          </Td>
                                      </Tr>
                                  ))
                              )}
                          </Tbody>
                      </Table>
                  </TableContainer>
              )}
  
              {/* Modal for Admin Details */}
              <Modal isOpen={isOpen} onClose={onClose} size="lg">
                  <ModalOverlay />
                  <ModalContent>
                      <ModalHeader>Admin Details</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                          {selectedAdmin && (
                              <VStack align="start" spacing={4}>
                                  <HStack>
                                      <Text fontWeight="bold">Username:</Text>
                                      <Text>{selectedAdmin.username}</Text>
                                  </HStack>
                                  <HStack>
                                      <Text fontWeight="bold">Role:</Text>
                                      <Badge colorScheme="green">{selectedAdmin.role}</Badge>
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
                      <ModalHeader>Edit Admin</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                          {editingAdmin && (
                              <VStack spacing={4}>
                                  <FormControl>
                                      <FormLabel>Username</FormLabel>
                                      <Input
                                          value={editingAdmin.username}
                                          onChange={(e) => handleEditChange('username', e.target.value)}
                                      />
                                  </FormControl>
                                  <FormControl>
                                      <FormLabel>Role</FormLabel>
                                      <Input
                                          value={editingAdmin.role}
                                          onChange={(e) => handleEditChange('role', e.target.value)}
                                          placeholder="admin, moderator, etc."
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
                              Delete Admin
                          </AlertDialogHeader>
                          <AlertDialogBody>
                              Are you sure you want to delete this admin? This action cannot be undone.
                              {selectedAdmin && (
                                  <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                                      <Text><strong>Username:</strong> {selectedAdmin.username}</Text>
                                      <Text><strong>Role:</strong> {selectedAdmin.role}</Text>
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
  
              {/* Add New Admin Modal */}
              <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
                  <ModalOverlay />
                  <ModalContent>
                      <ModalHeader>Add New Admin</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                          <VStack spacing={4} align="stretch">
                              <Box>
                                  <Text mb={1} fontWeight="medium">Username</Text>
                                  <Input
                                      placeholder="Enter username"
                                      value={newAdmin.username}
                                      onChange={(e) => handleNewAdminChange('username', e.target.value)}
                                  />
                              </Box>
                              <Box>
                                  <Text mb={1} fontWeight="medium">Password</Text>
                                  <Input
                                      type="password"
                                      placeholder="Enter password"
                                      value={newAdmin.password}
                                      onChange={(e) => handleNewAdminChange('password', e.target.value)}
                                  />
                              </Box>
                              <Box>
                                  <Text mb={1} fontWeight="medium">Role</Text>
                                  <Input
                                      placeholder="Enter role (e.g., admin, moderator)"
                                      value={newAdmin.role}
                                      onChange={(e) => handleNewAdminChange('role', e.target.value)}
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
