const users = require('./routes/users');
const auth = require('./routes/auth');
const cards = require('./routes/cards');
const express = require('express');
const cors = require('cors')
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const db = require("./utils/dbConnect")
const dblh = require("./utils/dbConnectLocalHost")


// db.connect()
dblh.connectLocalHost()

app.use(cors())
app.use(express.json());

app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/cards', cards);

app.get("/", (req,res) => {
  res.json("YAYYYYY")
})
const port = process.env.PORT || 4000;
http.listen(port, () => console.log(`Listening on port ${port}...`));