var cookieSession = require('cookie-session')
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('123', 10),
    user_id: 'lemon'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('123', 10),
    user_id: 'lime'
  }
};
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  secret: "development"
}))
app.use(bodyParser.urlencoded({extended: true}));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', createdBy: 'userRandomID', shortURL: 'b2xVn2'},
  '9sm5xK': {longURL: 'http://www.google.com', createdBy: 'user2RandomID', shortURL: '9sm5xK'},
  'asewf2': {longURL: 'http://www.yahoo.ca', createdBy: 'userRandomID', shortURL: 'asewf2'}
};


function generateRandomString() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }

  return text;
}

const addHTTP = function (longURL) {
  const substringHTTPS = 'https://';
  const substringHTTP = 'http://';
  if (longURL.includes(substringHTTP) === true || longURL.includes(substringHTTPS)) {
    return longURL;
  } else {
    return substringHTTP + longURL;
  }
};

app.get('/', function(req, res) {
  if (req.session.user_id) {
    res.redirect(302, '/urls');
    return
  } else {
    res.redirect(302, '/login');
  }
});


app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  //names of urls
  urllist = Object.keys(templateVars['urls']);
  userUrls = {};
  if(!templateVars.user) {
    res.send('<p><h1>Please <a href="/login">Login</a> or <a href="/register">Register</a> to view the Urls page.</h1></p>');
    return;
  }
  for (var i in urllist) {
    if (templateVars['urls'][urllist[i]]['createdBy'] === templateVars['user']['id']) {
      userUrls[templateVars['urls'][urllist[i]]['shortURL']] = templateVars['urls'][urllist[i]];
    }
  }
  templateVars['urls'] = userUrls;
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase, user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render('pages/urls_new', templateVars);
    return;
  }
  res.redirect(302, '/login');
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  urlDatabase[newShortURL] = { longURL: addHTTP(req.body.longURL), createdBy: req.session.user_id, shortURL: newShortURL};
  res.redirect(302, 'urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(302, '/urls');
});

app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (req.session.user_id) {
    res.redirect(302, '/urls');
    return
  }
  res.render('pages/register', templateVars);
});

app.post('/register', (req, res) => {
  password = bcrypt.hashSync(req.body.password, 10);
  email = req.body.email;
  let keys = Object.keys(users);
  var found = false;

  for(var i = 0; i < keys.length; i++) {
    user = users[keys[i]].email;
    if (user === email) {
      found = true;
    }
  }
  if (req.body.password === '' || email === '') {
    res.status(400);
    res.send('Please enter email and password');
    return;
  } if ( found === true ){
    res.status(400);
    res.send('User already exists. do you want to <a href="/login">Login</a>');
  } else {
    id = generateRandomString();
    user = { id: id, email: email, password: password};
    users[id] = user;
    req.session.user_id = id;
    res.redirect(302, '/urls');
  }
});

app.post('/login', (req, res) => {
  //need help here
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
    if (user.email === email && bcrypt.compareSync(password, user.password) === true) {
      req.session.user_id = user.id;
      res.redirect(302, '/urls');
      return;
    }
  }
  res.status(400);
  res.send('Login not correct');
});

app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (req.session.user_id) {
    res.redirect(302, '/urls');
    return
  }
  res.render('pages/login', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send( 'Error: NOT A VALID URL' );
    return;
  }
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(302, longURL);
    return;
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  let shortURL = req.params.shortURL;
  let shortURLkey = shortURL.toString();
  let creator = templateVars.urls[shortURLkey].createdBy;
  let user = req.session.user_id;
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
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  let newValue = addHTTP(req.body.longURL);
  urlDatabase[shortURL].longURL = newValue;
  res.redirect(302, '/urls/' + req.params.shortURL);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase, user: users[req.session.user_id] };
  var user_id = req.session.user_id;
  var shortURL = req.params.id;
  if (!urlDatabase[req.params.shortURL]) {
    res.send( 'Error: NOT A VALID URL' );
    return;
  }
  var urlcurrent = urlDatabase[shortURL].createdBy;
  if (urlcurrent === user_id) {
    res.render('pages/urls_show', templateVars);
    return;
  }
  res.redirect(302, '/urls');
});
