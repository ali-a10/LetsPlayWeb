const User = require('./models/User.js');
const Event = require('./models/Event.js');
const { getUsers, getUserById, addUser, editUser, getEvents, addEvent, editEvent, eventJoin, eventLeave, deleteEvent } = require('./dataHandler.js');
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
app.post('/submitSignup', async (req, res) => {
  try {
    const { username, email, password, phone, gender, favoriteSports, about, dob, profilePic } = req.body;
    let users = await getUsers();

    // Check for duplicates
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    if (users.some(user => user.username === username)) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    if (phone && users.some(user => user.phone === phone)) {
      return res.status(400).json({ success: false, message: 'Phone number already in use' });
    }

    // Create new user (with incremented id)
    // const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    // from gpt ^^, but i just used the line below this comment
    const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;

    const newUser = new User({
      id,
      username,
      email,
      password,
      phone,
      gender,
      favoriteSports,
      about,
      dob,
      // profilePic
    });

    // Save user to storage
    await addUser(newUser);

    // Store some info in session
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    };

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during sign up.' });
  }
});


app.post('/submitLogin', async (req, res) => {
  const { username, password } = req.body;
  const users = await getUsers();
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    req.session.user = { id: user.id, email : user.email, username : user.username, password : user.password };
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
  const {
    title,
    description,
    date,
    time,
    location,
    activity,
    isFree,
    price,
    currentParticipants,
    maxParticipants,
    ageGroup,
    level
  } = req.body;

  if (!title || !description || !date || !time || !location || !activity || (!isFree && !price) || !currentParticipants || !maxParticipants) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const events = await getEvents();
    const id = events.length > 0 ? events[events.length - 1].id + 1 : 1;

    const newEvent = new Event({
      id,
      userId: req.session.user.id,
      title,
      description,
      date,
      time,
      location,
      activity,
      isFree,
      price: isFree ? 0 : price,
      currentParticipants,
      maxParticipants,
      ageGroup,
      level,
      usersJoined: [req.session.user.id]
    });

    await addEvent(newEvent);
    res.status(201).json({ event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to save event' });
  }
});


app.put('/update-event/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    title,
    description,
    date,
    time,
    location,
    activity,
    isFree,
    price,
    currentParticipants,
    maxParticipants,
    ageGroup,
    level
  } = req.body;

  if (!title || !description || !date || !time || !location || !activity || (!isFree && !price) || !currentParticipants || !maxParticipants) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await editEvent(id, req.body);
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error updating event' });
  }
});


app.delete('/delete-event/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  try {
    await deleteEvent(eventId, req.session.user.id);
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error while deleting event' });
  }
});


app.put('/join', async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ success: false, message: "Missing eventId or userId." });
    }

    await eventJoin(eventId, userId);
    res.status(200).json({ success: true, message: `User successfully joined the event`});

  } catch (error) {
    console.error("Error in /join:", error.message);
    res.status(error.status).json({ success: false, message: error.message || "Server error while joining event." });
  }
});


app.put('/leave', async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ success: false, message: "Missing eventId or userId." });
    }

    await eventLeave(eventId, userId);
    res.status(200).json({ success: true, message: `User successfully left the event`});

  } catch (error) {
    console.error("Error in /leave:", error.message);
    res.status(error.status).json({ success: false, message: error.message || "Server error while leaving event." });
  }
});


// Get all past events for a user
app.get('/pastevents/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Load users + events
    const users = await getUsers();
    const events = await getEvents();

    // Find the user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Convert today to a comparable date (no time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all events the user joined
    const joinedEvents = events.filter(e => e.userId == userId);

    // Filter ONLY past events
    const pastEvents = joinedEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate < today;
    });

    return res.json({
      success: true,
      pastEvents
    });

  } catch (err) {
    console.error("Error getting past events:", err);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving past events"
    });
  }
});


// rate host 
app.put('/rate-host', async (req, res) => {
  try {
    const { hostId, rating } = req.body;
    const userId = req.session.user.id;
    if (!userId || !hostId || !rating) {
      return res.status(400).json({ success: false, message: 'Missing a required field' });
    }
    const users = await getUsers();
    const user = users.find(u => u.id === parseInt(hostId));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Update rating
    user.ratings[userId] = rating;
    let totalRating = 0;
    Object.keys(user.ratings).forEach(rater => {
      totalRating += user.ratings[rater];
    });
    user.averageRating = totalRating / Object.keys(user.ratings).length;

    await editUser(user.id, { ratings: user.ratings , averageRating: user.averageRating });
    return res.status(200).json({ success: true, ratings: user.ratings , averageRating: user.averageRating, message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Error rating host:', err);
    return res.status(500).json({ success: false, message: 'Server error while submitting rating' });
  }
});


//////////////// My Account page ////////////////
app.put('/editProfile/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    console.log("bodyy ", req.body);
    const { emailNew, usernameNew, passwordNew, phoneNew, genderNew, aboutNew, dobNew   } = req.body;
    console.log("usernameNew ", usernameNew);
    console.log("emailNew ", emailNew);
    console.log("passwordNew ", passwordNew);
    console.log("phoneNew ", phoneNew);
    const userId = parseInt(req.params.id);
    
    // const users = await getUsers();
    // // Check for duplicates
    // if (users.some(user => user.email === email)) {
    //   return res.status(400).json({ success: false, message: 'Email already in use' });
    // }

    // if (users.some(user => user.username === username)) {
    //   return res.status(400).json({ success: false, message: 'Username already exists' });
    // }

    // if (phone && users.some(user => user.phone === phone)) {
    //   return res.status(400).json({ success: false, message: 'Phone number already in use' });
    // }
    await editUser(userId, req.body);

    // Update session info
    req.session.user = {
      id: userId,
      username: usernameNew,
      email: emailNew
    };

    return res.status(200).json({ success: true, message: 'Profile updated successfully' });

  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    } 
    return res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
});

app.get('/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching user' });
  }
});


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
