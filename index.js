const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON data in request bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('static-content')); // Serve static files from 'static-content' directory


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


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
