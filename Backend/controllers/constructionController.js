const Team = require('../models/Team');
const jwt = require('jsonwebtoken');

// Helper function to parse requirements from string format
const parseRequirements = (requirements) => {
  const parsed = {};
  requirements.forEach(req => {
    // Parse format like "Property (2)" to { "Property": 2 }
    const match = req.match(/^(.+)\s*\((\d+)\)$/);
    if (match) {
      const resourceName = match[1].trim();
      const quantity = parseInt(match[2]);
      parsed[resourceName] = quantity;
    }
  });
  return parsed;
};

// Helper function to check if team has enough resources
const checkResourceRequirements = (teamResources, requirements) => {
  const parsedRequirements = parseRequirements(requirements);
  const missing = [];
  
  for (const [resource, requiredQty] of Object.entries(parsedRequirements)) {
    const availableQty = teamResources.get(resource) || 0;
    if (availableQty < requiredQty) {
      missing.push(`${resource} (need ${requiredQty}, have ${availableQty})`);
    }
  }
  
  return { isValid: missing.length === 0, missing };
};

// Helper function to deduct resources from team
const deductResources = (teamResources, requirements) => {
  const parsedRequirements = parseRequirements(requirements);
  
  for (const [resource, requiredQty] of Object.entries(parsedRequirements)) {
    const currentQty = teamResources.get(resource) || 0;
    teamResources.set(resource, currentQty - requiredQty);
  }
};

// Construct Enterprise
const constructEnterprise = async (req, res) => {
  try {
    const { enterpriseId, title, worth, requirements } = req.body;
    
    // Get team from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const team = await Team.findOne({ teamCode: decoded.teamCode });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check resource requirements
    const resourceCheck = checkResourceRequirements(team.resources, requirements);
    if (!resourceCheck.isValid) {
      return res.status(400).json({ 
        error: `Insufficient resources: ${resourceCheck.missing.join(', ')}`,
        type: 'insufficient_resources',
        missing: resourceCheck.missing
      });
    }

    // Deduct resources
    deductResources(team.resources, requirements);

    // Add enterprise to team inventory
    team.enterprises.push({
      id: enterpriseId,
      title,
      worth,
      constructedAt: new Date()
    });

    await team.save();

    // Emit socket update for real-time notifications
    const io = req.app.get('socketio');
    if (io) {
      io.emit('enterpriseConstructed', {
        teamCode: team.teamCode,
        teamName: team.teamName,
        enterprise: { id: enterpriseId, title, worth }
      });
    }

    res.json({
      success: true,
      message: `Successfully constructed "${title}"! Enterprise worth ₹${parseInt(worth).toLocaleString()} added to your inventory.`,
      enterprise: {
        id: enterpriseId,
        title,
        worth
      },
      updatedResources: Object.fromEntries(team.resources)
    });

  } catch (error) {
    console.error('Construction error:', error);
    res.status(500).json({ error: 'Failed to construct enterprise' });
  }
};

// Purchase Product
const purchaseProduct = async (req, res) => {
  try {
    const { productId, title, worth, requirements, requiredEnterpriseId } = req.body;
    
    // Get team from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const team = await Team.findOne({ teamCode: decoded.teamCode });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if required enterprise is owned
    const ownsRequiredEnterprise = team.enterprises.find(ent => 
      parseInt(ent.id) === parseInt(requiredEnterpriseId)
    );
    if (!ownsRequiredEnterprise) {
      .length
    });

    res.json({
      totalWorth,
      enterpriseWorth,
      productWorth,
      enterpriseCount: (team.enterprises || []).length,
      productCount: (team.products || []).length
    });

  } catch (error) {
    console.error('Get portfolio worth error:', error);
    res.status(500).json({ error: 'Failed to get portfolio worth' });
  }
};

module.exports = {
  constructEnterprise,
  purchaseProduct,
  getTeamInventory,
  getTeamPortfolioWorth
};