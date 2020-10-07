require("dotenv").config()
const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false);
const mongoConnect = {
    url: process.env.MONGO_URL,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    db: process.env.MONGO_DB
}

function generateUri(userConfig) {
    const {
        username,
        password,
        db,
        url
    } = userConfig
    return `mongodb+srv://${username}:${password}@${url}/${db}?retryWrites=true&w=majority`
}

function connect(userConfig = mongoConnect) {
    mongoose.connect(
        generateUri(userConfig), {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }
    ).then(() => console.log).catch((error) => console.log("could not connect to db", error))
}

module.exports = {
    connect
};