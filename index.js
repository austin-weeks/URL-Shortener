require('dotenv').config();
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//MongoDB Config
mongoose.connect(process.env.MONGO_URI);
const shortcutSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});
let Shortcut = mongoose.model('Shortcut', shortcutSchema);

//Main API Logic
//Posting new URLs to DB
app.post("/api/shorturl", (req, res) => {
  let reqURL = req.body.url;
  try {
    let cleanURL = new URL(reqURL);
    dns.lookup(cleanURL.hostname, async (err, address, family) => {
      if (err) {
        res.json({error: "Invalid URL. URL does not pass DNS lookup."});
        return;
      }
      const result = await Shortcut.findOne({original_url: reqURL});
      if (result) {
        res.json({
          original_url: result.original_url,
          short_url: result.short_url
        });
      } else {
        const newShortcut = new Shortcut({original_url: reqURL});
        const saveResult = await newShortcut.save();
        saveResult.short_url = convertID(saveResult._id);
        await saveResult.save();
        res.json({
          original_url: saveResult.original_url,
          short_url: saveResult.short_url
        });
      }
    });
  } catch (error) {
    res.json({ error: "Invalid URL. Be sure to preface urls with http:// or https://" })
  }

  function convertID(objID) {
    const idstring = objID.toString();
    const countHex = idstring.substring(idstring.length - 6);
    const count = parseInt(countHex, 16);

    return count;
  }
});

//Retrieving Shortcuts from DB
app.get("/api/shorturl/:shortcut", async (req, res) => {
  //If request url is not solely digits send error
  if (req.params.shortcut.match(/[\D]/g)) {
    sendError();
    return;
  }
  const result = await Shortcut.findOne({short_url: parseInt(req.params.shortcut)});
  console.log(result);
  if (result) {
    res.redirect(result.original_url);
  } else {
    sendError();
    return;
  }
  
  function sendError(){
    res.json({error: "This shortcut is not registered. Please submit the url via the api homepage and use the corresponding short_url"})
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
