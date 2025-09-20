import React from 'react'
import { Box, Flex, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Menu, MenuList, MenuButton, MenuItem, IconButton, Divider, Button } from '@chakra-ui/react';
import { BsPersonCircle } from "react-icons/bs";
import { CiLogout } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';

function HeaderAdmin({ file, setfile }) {
    const navigate = useNavigate();
    
    // Get current admin user from localStorage
    const getCurrentUser = () => {
        try {
            const userData = localStorage.getItem('adminUser');
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    };
    
    const currentUser = getCurrentUser();
    const username = currentUser?.username || "AdminUser";

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/', {replace: true});
    };
    let CurrentPage = "";
    switch (file) {
        case "dashboard":
            CurrentPage = "Dashboard";
            break;
        case "bidhistory":
            CurrentPage = "Bid History";
            break;
        case "adminmanagement":
            CurrentPage = "Admin Management";
            break;
        case "teamsmanagement":
            CurrentPage = "Teams Management";
            break;
        case "rounds":
            CurrentPage = "Rounds";
            break;
        case "worthcalculator":
            CurrentPage = "Worth Calculator";
            break;
        default:
            break;
    }

    return (
        <Box bg="transparent" px={2} py={1} mt={2} borderRadius="lg" position="relative" float="right" w="80%" top="0" display="-ms-inline-flexbox" alignItems="center" textColor="white">
            <Flex gap={4}>
                <Box display="flex" alignItems="center" marginEnd={'auto'}>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={() => setfile('dashboard')}>Admin</BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='#'>{CurrentPage}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </Box>
                <Box display="flex">
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label='Options'
                            icon={<BsPersonCircle />}
                            variant='none'
                        />
                        <MenuList bg="white" textColor="black">
                            <MenuItem>
                                Logged in as: {username}
                            </MenuItem>
                            <Divider></Divider>
                            <MenuItem onClick={handleLogout}>
                                <CiLogout /> &nbsp;Log Out
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
            </Flex>
        </Box>
    )
}

export default HeaderAdmin;
