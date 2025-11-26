const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({ 
   // housename , price, location, rating, photourl, description
    housename: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true},
    pdf: { type: String, required: true },
    description: { type: String, required: true},
});

exports.Home = mongoose.model('Home', homeSchema);

