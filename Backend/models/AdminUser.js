const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
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

module.exports = mongoose.model('AdminUser', adminUserSchema);
