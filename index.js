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

let events = [];  // This will act as the "database" for now
let users = [ {
  username: 'ali',
  email: 'ali@mail.com',
  password: '123'
},
{
  username: 'ali12',
  email: 'ali@mail.com',
  password: '123'
} ];

app.get('/account/:action', (req, res) => {
  res.sendFile(__dirname + '/static-content/account.html');
});

app.get('/a', (req, res) => {
  console.log("/a");

  res.sendFile(__dirname + '/static-content/about.html');
});



//////////////// Signup & login ////////////////
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const userExists = users.some(user => user.username === username || user.email === email);

  if (userExists) {
    res.status(400);
    res.json({ message: 'User already exists' });
    return;
  }

  const newUser = { username, email, password };
  users.push(newUser);
  res.status(201).json({ message: 'User created successfully' });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    req.session.user = { username : user.username };
    console.log(req.session);
    console.log(req.sessionID);
    res.json({ success: true });  ////// it was res.status(200).json(...), so make sure the status is 200
  } else {
    res.status(401);
    res.json({ success: false, message: 'Invalid username or password' });
  }
});


app.get('/logout', function (req, res, next) {
  // logout logic

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


// app.get('/about', (req, res) => {
//   res.sendFile(__dirname + '/static-content/about.html');
// });

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


app.get('/testing', (req, res) => {
  res.send("200!!!!!!!!!!");
})


//////////////// Events page ////////////////
app.get('/events', (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  if (req.session.user && req.session.events){
    res.json(req.session.events);
    return;
  }
  // req.session.visited = true;
  res.status(400).json({ error: 'Missing required fields' }); //temporsry, change to correct error msg & code
  // res.json(events);  // Respond with the list of events (your "database")
});


app.post('/create-event', (req, res) => {
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
  };
  if (req.session.events){
    req.session.events.push(newEvent);
  }
  else {
    req.session.events = [newEvent];
  }
  events.push(newEvent);
  res.status(201);
  res.json({ event: newEvent })
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
