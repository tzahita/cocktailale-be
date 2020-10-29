
const mongoose = require("mongoose")


function connectLocalHost() {
    mongoose.connect('mongodb://localhost/my_rest_api', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      }).then(() => console.log('Connected to MongoDB...'))
        .catch(err => console.error('Could not connect to MongoDB...'));
}

module.exports = {
    connectLocalHost
};