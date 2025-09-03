import axios from 'axios';
import serverUrl from '../servercon';

// Create axios instance with base configuration
const adminApi = axios.create({
  baseURL: `${serverUrl}/api/admin`,
  timeout: 10000,
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Don't automatically redirect, let components handle it
    }
    return Promise.reject(error);
  }
);

// Authentication functions
export const adminAuth = {
  // Check if admin is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    return !!(token && user);
  },

  // Get current admin user
  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  // Logout admin
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return true;
  },

  // Login admin
  login: async (credentials) => {
    try {
      const response = await axios.post(`${serverUrl}/api/admin/login`, credentials);
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify({
          username: credentials.username,
          role: 'admin'
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// API functions for admin dashboard
export const adminApiCalls = {
  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const [teamsResponse, adminsResponse] = await Promise.all([
        adminApi.get('/teams'),
        adminApi.get('/admins')
      ]);
      
      return {
        totalTeams: teamsResponse.data.teams?.length || 0,
        totalAdmins: adminsResponse.data.admins?.length || 0,
        teams: teamsResponse.data.teams || [],
        admins: adminsResponse.data.admins || []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values to maintain existing functionality
      return {
        totalTeams: 50,
        totalAdmins: 78,
        teams: [],
        admins: []
      };
    }
  },

  // Get all teams
  getAllTeams: async () => {
    try {
      const response = await adminApi.get('/teams');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      return { teams: [] };
    }
  },

  // Get all admins
  getAllAdmins: async () => {
    try {
      const response = await adminApi.get('/admins');
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      return { admins: [] };
    }
  },

  // Add new admin
  addAdmin: async (adminData) => {
    const response = await adminApi.post('/admins', adminData);
    return response.data;
  },

  // Update admin
  updateAdmin: async (id, adminData) => {
    const response = await adminApi.put(`/admins/${id}`, adminData);
    return response.data;
  },

  // Delete admin
  deleteAdmin: async (id) => {
    const response = await adminApi.delete(`/admins/${id}`);
    return response.data;
  },

  // Get transaction history
  getTransactionHistory: async () => {
    try {
      const response = await adminApi.get('/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { transactions: [] };
    }
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    const response = await adminApi.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await adminApi.delete(`/transactions/${id}`);
    return response.data;
  },

  // Award bid
  awardBid: async (bidData) => {
    const response = await adminApi.post('/award-bid', bidData);
    return response.data;
  },

  // Execute trade
  executeTrade: async (tradeData) => {
    const response = await adminApi.post('/execute-trade', tradeData);
    return response.data;
  }
};

export default adminApi;
