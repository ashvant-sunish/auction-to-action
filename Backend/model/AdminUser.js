const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  // Username field: must be unique, required, and trimmed (removes whitespace)
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  // Password field: required, will be stored as a hashed value
  password: { 
    type: String, 
    required: true 
  },
  // Role field: defaults to "admin" (useful if later we add other roles)
  role: { 
    type: String, 
    default: 'admin' 
  },
});

// This method ensures that the hashed password is never sent back
// in any API response, enhancing security.
adminUserSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  return adminObject;
};
// Export the model for use in controllers and routes
module.exports = mongoose.model('AdminUser', adminUserSchema);
