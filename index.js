const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON data in request bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('static-content')); // Serve static files from 'static-content' directory

const events = [];  // This will act as the "database" for now

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static-content/index.html');
  });


app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/static-content/about.html');
});


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
