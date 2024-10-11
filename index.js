const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON data in request bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('static-content')); // Serve static files from 'static-content' directory

let events = [];  // This will act as the "database" for now
let users = [ {
  username: 'ali',
  email: 'ali@mail.com',
  password: '123'
} ];

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/static-content/index.html');
// });

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
    res.json({ success: true });  ////// it was res.status(200).json(...), so make sure the status is 200
  } else {
    res.status(401);
    res.json({ success: false, message: 'Invalid username or password' });
  }
});


// app.get('/about', (req, res) => {
//   res.sendFile(__dirname + '/static-content/about.html');
// });

//////////////// testing ////////////////
app.post('/submit', (req, res) => {
  const name = req.body.name;
  const age = req.body;
  console.log(name);

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
  res.json(events);  // Respond with the list of events (your "database")
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

  events.push(newEvent);
  res.status(201);
  res.json({ event: newEvent })
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
