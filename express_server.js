var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const addHTTP =function (longURL) {
  var substringHTTPS = "https://",
      substringHTTP = "http://";
  if (longURL.includes(substringHTTP) === true || longURL.includes(substringHTTPS)) {
    return longURL;
  } else {
    return substringHTTP + longURL;
  }
};

app.get('/', function(req, res) {
    res.status(200);
    res.render('pages/index');
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.status(200);
  res.render('pages/urls_index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase };
  res.status(200);
  res.render("pages/urls_show", templateVars);
});

app.get('/new', function(req, res) {
    res.status(200);
    res.render('pages/urls_new');
});

app.post("/urls", (req, res) => {
  console.log(addHTTP(req.body.longURL));
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = addHTTP(req.body.longURL);
  let templateVars = { urls: urlDatabase };
  res.render('pages/urls_index', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = { urls: urlDatabase };
  let shortURL = req.params.shortURL;
  let shortURLkey = shortURL.toString();
  delete templateVars.urls[shortURLkey];
  res.redirect(302, '/urls');
});

app.post("/urls/:shortURL/update", (req, res) => {
  //update the db with new long url
  let longURL = urlDatabase[req.params.shortURL];
  let shortURL = req.params.shortURL;
  let templateVars = { urls: urlDatabase };
  let newValue = addHTTP(req.body.longURL);
  templateVars.urls[shortURL] = [newValue];
  res.redirect(302, '/urls/' + req.params.shortURL);
});