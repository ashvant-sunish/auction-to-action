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
      console.log('Enterprise check failed:', {
        requiredEnterpriseId,
        ownedEnterprises: team.enterprises.map(ent => ({ id: ent.id, title: ent.title }))
      });
      return res.status(400).json({ 
        error: `You need to own the required enterprise (ID: ${requiredEnterpriseId}) to purchase this product`,
        type: 'missing_enterprise'
      });
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

    // Add product to team inventory
    team.products.push({
      id: productId,
      title,
      worth,
      requiredEnterpriseId,
      purchasedAt: new Date()
    });

    await team.save();

    // Emit socket update for real-time notifications
    const io = req.app.get('socketio');
    if (io) {
      io.emit('productPurchased', {
        teamCode: team.teamCode,
        teamName: team.teamName,
        product: { id: productId, title, worth }
      });
    }

    res.json({
      success: true,
      message: `Successfully purchased "${title}"! Product worth ₹${parseInt(worth).toLocaleString()} added to your inventory.`,
      product: {
        id: productId,
        title,
        worth
      },
      updatedResources: Object.fromEntries(team.resources)
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase product' });
  }
};

// Get team's constructed enterprises and purchased products
const getTeamInventory = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const team = await Team.findOne({ teamCode: decoded.teamCode });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      enterprises: team.enterprises || [],
      products: team.products || [],
      resources: Object.fromEntries(team.resources)
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to get team inventory' });
  }
};

// Get team portfolio worth
const getTeamPortfolioWorth = async (req, res) => {
  try {
    // Get team from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teamId = decoded.teamId;

    console.log('Getting portfolio worth for team ID:', teamId);
    console.log('Decoded token:', decoded);

    // Use findById since teamId in JWT is the MongoDB _id
    const team = await Team.findById(teamId);
    if (!team) {
      console.log('Team not found with ID:', teamId);
      return res.status(404).json({ error: 'Team not found' });
    }

    console.log('Found team:', team.teamCode);
    console.log('Team enterprises:', team.enterprises);
    console.log('Team products:', team.products);

    // Calculate total worth
    const enterpriseWorth = (team.enterprises || []).reduce((total, enterprise) => {
      const worth = parseInt(enterprise.worth) || 0;
      console.log(`Enterprise ${enterprise.title}: ${worth}`);
      return total + worth;
    }, 0);

    const productWorth = (team.products || []).reduce((total, product) => {
      const worth = parseInt(product.worth) || 0;
      console.log(`Product ${product.title}: ${worth}`);
      return total + worth;
    }, 0);

    const totalWorth = enterpriseWorth + productWorth;

    console.log('Portfolio calculation:', {
      teamCode: team.teamCode,
      enterpriseWorth,
      productWorth,
      totalWorth,
      enterpriseCount: (team.enterprises || []).length,
      productCount: (team.products || []).length
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