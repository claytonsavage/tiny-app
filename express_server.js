var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
}
app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};


function generateRandomString() {
  var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const addHTTP =function (longURL) {
  var substringHTTPS = 'https://',
      substringHTTP = 'http://';
  if (longURL.includes(substringHTTP) === true || longURL.includes(substringHTTPS)) {
    return longURL;
  } else {
    return substringHTTP + longURL;
  }
};

app.get('/', function(req, res) {
    res.redirect(302, '/urls');
});


app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase, username: req.cookies['username'] };
  res.render('pages/urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = addHTTP(req.body.longURL);
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('pages/urls_index', templateVars);
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect(302, '/urls');
});

app.post('/logout', (req, res) => {
  let username = req.body.username;
  res.clearCookie('username');
  res.redirect(302, '/urls');
});

app.get ('/register', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('pages/register', templateVars);
});

app.post ('/register', (req, res) => {
  password = req.body.password;
  email = req.body.email;
  let keys = Object.keys(users);
  var found = false;

  for(var i = 0; i < keys.length; i++) {
    emailsofall = users[keys[i]].email;
    if (emailsofall == email) {
      found = true;
    }
  }
  if (password === '' || email === '') {
    res.status(400);
    res.send('Please enter email and password');
  return;
  } if ( found === true ){
    console.log('already exists');
    res.status(400);
    res.send('User already exists');
  } else {
      id = generateRandomString();
      username = { id: id, email: email, password: password};
      users[id] = username;
      res.cookie('user_id', id);
      res.redirect(302, '/urls');
  }
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL !== undefined) {
  res.redirect(302, longURL);
  } else if (longURL === undefined) {
  res.send( 'Error: NOT A VALID URL' );
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  let shortURL = req.params.shortURL;
  let shortURLkey = shortURL.toString();
  delete templateVars.urls[shortURLkey];
  res.redirect(302, '/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let shortURL = req.params.shortURL;
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  let newValue = addHTTP(req.body.longURL);
  templateVars.urls[shortURL] = [newValue];
  res.redirect(302, '/urls/' + req.params.shortURL);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase, username: req.cookies['username'] };
  res.render('pages/urls_show', templateVars);
});
