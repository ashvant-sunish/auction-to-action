// seed/enterprisesAndProductsData.js

const finalProductsData = [
  // --- Enterprises ---
  { productId: 'ENT01', type: 'Enterprise', name: 'Eco-Furniture Workshop', reward: 45000, requirements: { 'Property': 2, 'Skilled Labour': 2, 'Construction Material': 1 } },
  { productId: 'ENT02', type: 'Enterprise', name: 'Solar Lighting Solutions Assembly Unit', reward: 60000, requirements: { 'Property': 2, 'Technology': 2, 'Electricity Supply': 1, 'Skilled Labour': 1 } },
  { productId: 'ENT03', type: 'Enterprise', name: 'Nutrient-Rich Food Products Unit', reward: 55000, requirements: { 'Property': 2, 'Machinery & Tools': 2, 'Utilities': 1 } },
  { productId: 'ENT04', type: 'Enterprise', name: 'Community Water Purification & Bottling Center', reward: 50000, requirements: { 'Property': 2, 'Machinery & Tools': 2, 'Electricity Supply': 1 } },
  { productId: 'ENT05', type: 'Enterprise', name: 'Recycled Glass Products Studio', reward: 65000, requirements: { 'Property': 2, 'Construction Material': 2, 'Electricity Supply': 1 } },
  { productId: 'ENT06', type: 'Enterprise', name: 'Women-Led Stitching & Tailoring Unit', reward: 40000, requirements: { 'Property': 2, 'Skilled Labour': 2, 'Machinery & Tools': 1 } },
  { productId: 'ENT07', type: 'Enterprise', name: 'Community Bicycle Repair & Rental Hub', reward: 45000, requirements: { 'Property': 2, 'Machinery & Tools': 2, 'Skilled Labour': 1 } },
  { productId: 'ENT08', type: 'Enterprise', name: 'Rural Handicrafts & Artisan Collective', reward: 35000, requirements: { 'Property': 2, 'Skilled Labour': 2, 'Utilities': 1 } },
  { productId: 'ENT09', type: 'Enterprise', name: 'Urban Recycling Booth', reward: 30000, requirements: { 'Property': 2, 'Machinery & Tools': 1, 'Skilled Labour': 1 } },
  { productId: 'ENT10', type: 'Enterprise', name: 'Youth Career Guidance Center', reward: 40000, requirements: { 'Property': 2, 'Office Space': 2, 'Technology': 1 } },
  { productId: 'ENT11', type: 'Enterprise', name: 'Agro-Tech Support Center', reward: 60000, requirements: { 'Property': 2, 'Technology': 2, 'Utilities': 1 } },
  { productId: 'ENT12', type: 'Enterprise', name: 'Rainwater Reserve Vault', reward: 55000, requirements: { 'Property': 2, 'Construction Material': 2, 'Utilities': 1 } },
  { productId: 'ENT13', type: 'Enterprise', name: 'SunSpot Energy Center', reward: 75000, requirements: { 'Property': 2, 'Technology': 2, 'Electricity Supply': 1, 'Skilled Labour': 1 } },
  { productId: 'ENT14', type: 'Enterprise', name: 'UrbanRoots Garden Center', reward: 65000, requirements: { 'Property': 2, 'Skilled Labour': 2, 'Utilities': 1 } },
  { productId: 'ENT15', type: 'Enterprise', name: 'WeCare Health Studio', reward: 50000, requirements: { 'Property': 2, 'Office Space': 2, 'Skilled Labour': 1 } },

  // --- Products (linked to Enterprises) ---
  { productId: 'PROD01', type: 'Product', name: 'Sustainable Wooden Chairs', reward: 4000, requirements: { 'Construction Material': 1, 'Skilled Labour': 1 }, parentEnterpriseId: 'ENT01' },
  { productId: 'PROD02', type: 'Product', name: 'Purified Drinking Water Packs', reward: 3000, requirements: { 'Machinery & Tools': 1, 'Electricity Supply': 1 }, parentEnterpriseId: 'ENT04' },
  { productId: 'PROD03', type: 'Product', name: 'Handmade Cloth Bags', reward: 4000, requirements: { 'Machinery & Tools': 1, 'Skilled Labour': 1 }, parentEnterpriseId: 'ENT06' },
  { productId: 'PROD04', type: 'Product', name: 'Recycled Paper Stationery', reward: 3500, requirements: { 'Machinery & Tools': 1, 'Skilled Labour': 1 }, parentEnterpriseId: 'ENT09' },
  { productId: 'PROD05', type: 'Product', name: 'Affordable Seed Kits', reward: 4500, requirements: { 'Technology': 1, 'Utilities': 1 }, parentEnterpriseId: 'ENT11' },
];

module.exports = finalProductsData;