/* jshint esversion:6 */

var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '123',
    user_id: 'lemon'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

var urlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', createdBy: 'userRandomID', shortURL: 'b2xVn2'},
  '9sm5xK': {longURL: 'http://www.google.com', createdBy: 'user2RandomID', shortURL: '9sm5xK'}
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
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase, user: users[req.cookies.user_id] };
  if (templateVars.user) {
  res.render('pages/urls_new', templateVars);
  }
  res.redirect(302, '/login');
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  urlDatabase[newShortURL] = { longURL: addHTTP(req.body.longURL), createdBy: req.cookies.user_id, shortURL: newShortURL};
  console.log(urlDatabase);
  res.render('pages/urls_index', templateVars);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(302, '/urls');
});

app.get ('/register', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render('pages/register', templateVars);
});

app.post ('/register', (req, res) => {
  password = req.body.password;
  email = req.body.email;
  let keys = Object.keys(users);
  var found = false;

  for(var i = 0; i < keys.length; i++) {
    user = users[keys[i]].email;
    if (user == email) {
      found = true;
    }
  }
  if (password === '' || email === '') {
    res.status(400);
    res.send('Please enter email and password');
  return;
  } if ( found === true ){
    res.status(400);
    res.send('User already exists');
  } else {
      id = generateRandomString();
      user = { id: id, email: email, password: password};
      users[id] = user;
      res.cookie('user_id', id);
      res.redirect(302, '/urls');
  }
});

app.post ('/login', (req, res) => {
  password = req.body.password;
  email = req.body.email;
  var found = false;
  if (!password || !email) {
    res.status(400);
    res.send('Please enter email and password');
    return;
  }
  let keys = Object.keys(users);
  for(var i = 0; i < keys.length; i++) {
    const user = users[keys[i]];
    if (user.email == email && user.password == password) {
      res.cookie('user_id', user.id);
      res.redirect(302, '/urls');
      return;
    }
  }
  res.status(400);
  res.send('Login not correct');
});

app.get ('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render('pages/login', templateVars);
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
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  let shortURL = req.params.shortURL;
  let shortURLkey = shortURL.toString();
  let creator = templateVars.urls[shortURLkey].createdBy;
  let user = req.cookies.user_id;
  if (creator === user ) {
  delete templateVars.urls[shortURLkey];
  res.redirect(302, '/urls');
  return;
  }
  res.redirect(302, '/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  let shortURL = req.params.shortURL;
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  let newValue = addHTTP(req.body.longURL);
  urlDatabase[shortURL].longURL = newValue;
  res.redirect(302, '/urls/' + req.params.shortURL);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase, user: users[req.cookies.user_id] };
  var userid = req.cookies.user_id;
  var shortURL = req.params.id;
  var urlcurrent = urlDatabase[shortURL].createdBy;
  if (urlcurrent === userid) {
  res.render('pages/urls_show', templateVars);
  return;
  }
  res.redirect(302, '/urls');
});
