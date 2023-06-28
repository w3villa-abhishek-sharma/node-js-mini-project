const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URL;
    
const connectToMongo = () => {
    mongoose.connect(mongoURI).then(() => {
        console.log("Successfully");
    }).catch(error => console.log(error));
}

module.exports = connectToMongo;