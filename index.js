const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('static-content'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static-content/index.html');
  });


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
