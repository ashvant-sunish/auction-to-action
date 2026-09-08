// utils/notificationHelper.js

const Notification = require('../models/Notification');

/**
 * Format resources (Map or Object) into clean bulleted text.
 * e.g.
 * Iron — 20
 * Coal — 10
 * Technology Access — 5
 */
function formatResourcesList(resources) {
  if (!resources) return '';

  let entries = [];
  if (resources instanceof Map) {
    entries = Array.from(resources.entries());
  } else if (Array.isArray(resources)) {
    entries = resources.map(item => [item.name || item.resourceName, item.quantity || item.count || 1]);
  } else if (typeof resources === 'object') {
    entries = Object.entries(resources);
  }

  const validEntries = entries.filter(([, qty]) => Number(qty) > 0);
  if (validEntries.length === 0) return '';

  return validEntries
    .map(([name, qty]) => `${name} — ${qty}`)
    .join('\n');
}

/**
 * Format trade transfer items & money into human-readable summary.
 * e.g. "₹15,000 + Iron ×20"
 */
function formatTradeTransfer(transfer) {
  if (!transfer) return 'Nothing';

  const parts = [];
  const money = Number(transfer.money) || 0;
  if (money > 0) {
    parts.push(`₹${money.toLocaleString('en-IN')}`);
  }

  if (Array.isArray(transfer.items) && transfer.items.length > 0) {
    const itemStrings = transfer.items
      .filter(item => item && (item.name || item.itemName) && (Number(item.quantity) || 1) > 0)
      .map(item => `${item.name || item.itemName} ×${Number(item.quantity) || 1}`);
    if (itemStrings.length > 0) {
      parts.push(itemStrings.join(' + '));
    }
  }

  return parts.length > 0 ? parts.join(' + ') : 'Nothing';
}

/**
 * Creates a persistent notification in MongoDB and emits it via Socket.IO
 * strictly to the targeted team room (team_${teamCode}) and admin room for superadmin.
 *
 * @param {Object} io - Socket.io instance
 * @param {Object} params
 * @param {string} params.teamCode - Unique recipient team code
 * @param {string} [params.teamName] - Recipient team name
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message text
 * @param {number} params.round - Game round (1, 2, or 3)
 * @param {string} params.type - Notification category
 * @param {Object} [params.data] - Additional metadata
 * @returns {Promise<Object|null>} The saved notification document or null
 */
async function sendTargetedNotification(io, {
  teamCode,
  teamName = '',
  title,
  message,
  round,
  type = 'ADMIN_ACTION',
  data = {}
}) {
  if (!teamCode || !title || !message) {
    console.warn('⚠️ Missing required parameters for targeted notification:', { teamCode, title });
    return null;
  }

  try {
    // 1. Persist notification in database
    const notification = new Notification({
      recipientTeamCode: teamCode.trim(),
      recipientTeamName: teamName.trim(),
      title,
      message,
      round,
      type,
      data,
      read: false,
      createdAt: new Date()
    });

    await notification.save();
    
    // 2. Emit targeted real-time event via Socket.IO
    if (io) {
      const payload = {
        _id: notification._id,
        recipientTeamCode: notification.recipientTeamCode,
        recipientTeamName: notification.recipientTeamName,
        title: notification.title,
        message: notification.message,
        round: notification.round,
        type: notification.type,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt
      };

      // Strict targeted emission ONLY to the affected team room
      io.to(`team_${notification.recipientTeamCode}`).emit('newNotification', payload);
      
      // Also emit to admin room for superadmin visibility
      io.to('admin').emit('newNotification', {
        ...payload,
        forSuperAdmin: true,
        targetTeamCode: notification.recipientTeamCode
      });
      } else {
      console.warn('⚠️ Socket.IO instance not available on req.app');
    }

    return notification;
  } catch (error) {
    console.error('❌ Error sending targeted notification:', error.message);
    // Return null so the main admin operation isn't broken
    return null;
  }
}

module.exports = {
  formatResourcesList,
  formatTradeTransfer,
  sendTargetedNotification
};
