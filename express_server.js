var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('pages/urls_index', templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase };
  res.render("pages/urls_show", templateVars);
});

app.get('/new', function(req, res) {
    res.render('pages/urls_new');
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  let templateVars = { urls: urlDatabase };
  res.render('pages/urls_index', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL =urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});