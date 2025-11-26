const mongoose = require('mongoose');

const user = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['host', 'guest'], required: true },
    favourites:
      [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Home'
      }]
})

module.exports = mongoose.model('User', user);