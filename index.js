const { getUsers, addUser, editUser, getEvents, addEvent, updateEvent } = require('./dataHandler.js');
const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON data in request bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  secret: 'your-secret-key', // Use a strong secret key
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 60 } // maxAge is 1 hour, adjust as needed
  })
);
app.use(express.static('static-content')); // Serve static files from 'static-content' directory

let events = [];
// let users = getUsers();  // should i call this here or call it in every api call when needed
                        // put in api calls^


app.get('/account/:action', (req, res) => {
  res.sendFile(__dirname + '/static-content/account.html');
});


//////////////// Signup & login ////////////////
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  let users = await getUsers();

  // Check if user already exists
  if (users.some(user => user.email === email)) {
    res.status(400);
    res.json({ success: false, message: 'Email already in use' });
    return;
  }

  if (users.some(user => user.username === username)) {
    res.status(400);
    res.json({ success: false, message: 'Username already exists' });
    return;
  }
  const id = users.length + 1;
  const newUser = { id, username, email, password };
  users.push(newUser);
  await addUser(newUser);
  req.session.user = { user_id: id, email : email, username : username, password : password };
  res.status(201).json({ success: true });
});


app.post('/submitLogin', async (req, res) => {
  const { username, password } = req.body;
  const users = await getUsers();
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    req.session.user = { user_id: user.id, email : user.email, username : user.username, password : user.password };
    console.log(req.session);
    console.log(req.sessionID);
    res.status(200).json({ success: true });  ////// it was res.status(200).json(...), so make sure the status is 200
  } else {
    res.status(401);
    res.json({ success: false, message: 'Invalid username or password' });
  }
});


app.get('/logout', function (req, res, next) {
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user

  // ALI edit: should check that a user is logged in first
  req.session.user = null
  req.session.save(function (err) {
  if (err) res.json({ success: false, message: 'error for Log out' })//next(err)

  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(function (err) {
    if (err) res.json({ success: false, message: 'error for Log out' })//next(err)
    console.log(req.session);
    res.json({ success: true, message: 'Logged out' });
  })
    
    // req.session.destroy(function(err) {
    //   if (err) {
    //     return res.status(500).send('Failed to destroy session.');
    //   }
    //   console.log(req.session);
    //   res.json({ success: true, message: 'Logged out' });
      
    // }) 
  })
})


app.get('/auth/status', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
})


//////////////// testing ////////////////
app.post('/submit', (req, res) => {
  const name = req.body.name;
  const age = req.body;
  console.log(name);
  console.log(req.sessionID);

  // Process form data (e.g., log it or send an email)
  // console.log("here");\
  // res.send(name);
  res.send(age);
});


//////////////// Events page ////////////////
app.get('/getEvents', async (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  if (req.session.user){
    // res.json(req.session.events);
    const events = await getEvents();
    res.json(events);
    return;
  }
  res.status(400).json({ error: 'Missing required fields' }); //temporsry, change to correct error msg & code
  // res.json(events);  // Respond with the list of events (your "database")
});


app.post('/post-event', async (req, res) => {
  const { title, date, sport, price } = req.body;
  if (!title || !date || !sport || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // will also need user info in the event (username, maybe date event is created)
  // might want to give events ids
  const newEvent = {
    title,
    date,
    sport,
    price,
    createdBy: req.session.user.id
  };
  
  try {
    await addEvent(newEvent);
    res.status(201).json({ event: newEvent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save event' });
  }
});


app.put('/update-event/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, date, sport, price } = req.body;

  if (!title || !date || !sport || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await updateEvent(id, { title, date, sport, price });
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error updating event' });
  }
});



//////////////// My Account page ////////////////
app.put('/editProfile/:username', async (req, res) => {
  if (req.session.user) {
    const username = req.params.username;
    let newEmail = req.body.newEmail;
    let newUsername = req.body.newUsername;  // should we prevent usernames from being changed in the future??

    const users = await getUsers();
    const currUser = users.find(user => user.username === username); // use id to find instead
    // for comment on line above, prob use req.session.user.id
    const userWNewEmail = users.find(user => user.email === newEmail);
    if (userWNewEmail && currUser != userWNewEmail) {
      res.json({ success: false, message: 'This email is already in use' });
      // what status??
      return;
    }

    const userWNewUsername = users.find(user => user.username === newUsername);
    if (userWNewUsername && currUser != userWNewEmail) {
      res.json({ success: false, message: 'This username is already in use' });
      // what status??
      return;
    }

    const updatedUserInfo = { email: newEmail, username: newUsername };
    try {
      await editUser(username, updatedUserInfo);
      if (newEmail !== null) req.session.user.email = newEmail;
      if (newUsername !== null) req.session.user.username = newUsername;
      res.status(200).json({ success: true, message: 'User updated successfully' });
    }
    catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
})


// Express uses the first matching route it encounters in the order they are declared
// so we have to put this at the end so it doesn't intefere with '/getEvents' for example
app.get('/:page', (req, res) => {
  let page = req.params.page

  // if user isn't logged in, they shouldn't be able to access account.html
  if (page === 'account' && !req.session.user) {
    return res.redirect('login');
  }

  // i still dk if we wanna move this to its own function:
  if (page === 'create' && req.session.user) {
    res.sendFile(__dirname + '/static-content/event-edit.html');
  }
  res.sendFile(__dirname + '/static-content/' + page + '.html');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
