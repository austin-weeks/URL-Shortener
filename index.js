require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//MongoDB Config
mongoose.connect(process.env.MONGO_URI);
const shortcutSchema = new mongoose.Schema({
  shortcut_id: Number,
  URL: String
});
let Shortcut = mongoose.model('Shortcut', shortcutSchema);

//Main API Logic
app.post("/api/shorturl", (req, res) => {
  console.log(req.params);
});

app.get("/api/shorturl/:shortcut", (req, res) => {
  console.log(req.params);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
