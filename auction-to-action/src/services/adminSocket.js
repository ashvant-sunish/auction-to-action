import axios from 'axios';
import { socketServerUrl } from '../servercon';
// Admin API functions that trigger real-time updates via Socket.IO



/**
 * Update current round with real-time broadcasting to all users
 * @param {number} roundNumber - Round number (1, 2, 3)
 * @param {string} roundStatus - Round status ('started', 'ended', 'ongoing')
 */
export const updateRoundRealtime = async (roundNumber, roundStatus = 'ongoing') => {
  try {
    const token = localStorage.getItem('adminToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.post(`${socketServerUrl}/admin/updateRound`, {
      roundNumber,
      roundStatus,
      timestamp: new Date().toISOString()
    }, { headers });

    console.log('✅ Round updated with real-time broadcast:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating round:', error);
    throw error;
  }
};

/**
 * Update team data (credit, debit, items) with real-time broadcasting
 * @param {string} teamNumber - Team identifier
 * @param {number} creditChange - Credit amount to add/subtract
 * @param {number} debitChange - Debit amount to add/subtract  
 * @param {string} addItem - Item to add to team inventory
 * @param {string} removeItem - Item to remove from team inventory
 * @param {string} broadcastScope - 'team' or 'all' for broadcast scope
 */
export const updateTeamRealtime = async (teamNumber, {
  creditChange = 0,
  debitChange = 0,
  addItem = null,
  removeItem = null,
  broadcastScope = 'all'
}) => {
  try {
    const token = localStorage.getItem('adminToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.post(`${socketServerUrl}/admin/updateTeam`, {
      teamNumber,
      creditChange,
      debitChange,
      addItem,
      removeItem,
      broadcastScope
    }, { headers });

    console.log('✅ Team updated with real-time broadcast:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating team:', error);
    throw error;
  }
};

/**
 * Execute trade between teams with real-time updates
 * @param {string} teamA - First team identifier
 * @param {string} teamB - Second team identifier
 * @param {string} itemFromA - Item to transfer from team A to team B
 * @param {number} creditFromB - Credit amount to transfer from team B to team A
 * @param {string} broadcastScope - 'team' or 'all' for broadcast scope
 */
export const executeTradeRealtime = async (teamA, teamB, {
  itemFromA = null,
  creditFromB = 0,
  broadcastScope = 'all'
}) => {
  try {
    const token = localStorage.getItem('adminToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.post(`${socketServerUrl}/admin/trade`, {
      teamA,
      teamB,
      itemFromA,
      creditFromB,
      broadcastScope
    }, { headers });

    console.log('✅ Trade executed with real-time broadcast:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error executing trade:', error);
    throw error;
  }
};

/**
 * Examples of how to use these functions:
 */

// Example 1: Add credits to a team
// updateTeamRealtime('001', { creditChange: 1000, broadcastScope: 'team' });

// Example 2: Deduct credits and add item to team
// updateTeamRealtime('002', { 
//   creditChange: -500, 
//   addItem: 'Premium Material',
//   broadcastScope: 'all' 
// });

// Example 3: Execute trade between teams
// executeTradeRealtime('001', '002', {
//   itemFromA: 'Construction Tool',
//   creditFromB: 750,
//   broadcastScope: 'all'
// });

export default {
  updateRoundRealtime,
  updateTeamRealtime,
  executeTradeRealtime
};
