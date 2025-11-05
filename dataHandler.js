// import fs from 'fs/promises';
const fs = require('fs/promises');
const User = require('./models/User');

const USERS_FILE = './jsonDB/users.json';
const EVENTS_FILE = './jsonDB/events.json';

// Helper to read JSON data from a file
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data); // parse JSON string into an object/array
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Helper to write JSON data to a file
async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2)); // save with 2-space indentation
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
  }
}


async function getUsers() {
  const users = await readJSON(USERS_FILE);
  return users.map(u => new User(u));
}


async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}


async function addUser(user) {
  const users = await getUsers();
  const newUser = user instanceof User ? user : new User(user);
  users.push(newUser.userToJSON());
  await writeJSON(USERS_FILE, users);
}


async function editUser(id, updatedUserInfo) {
  const users = await getUsers();

  // Find the index of the user to edit
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    throw new Error(`User not found`);
  }

  // Check for unique username, email, and phone number
  for (const user of users) {
    if (user.username === updatedUserInfo.username && user.id !== id) {
      throw new Error('Username already in use');
    }
    if (user.email === updatedUserInfo.email && user.id !== id) {
      throw new Error('Email already in use');
    }
    if (user.phone === updatedUserInfo.phone && user.id !== id) {
      throw new Error('Phone number already in use');
    }
  }

  // Update the user details
  // const userToUpdate = users[userIndex];
  // if (updatedUserInfo.username) userToUpdate.username = updatedUserInfo.username;
  // if (updatedUserInfo.email) userToUpdate.email = updatedUserInfo.email;
  // if (updatedUserInfo.password) userToUpdate.password = updatedUserInfo.password;
  // if (updatedUserInfo.phone) userToUpdate.phone = updatedUserInfo.phone;
  const userToUpdate = new User(users[userIndex]);
  userToUpdate.updateFields(updatedUserInfo);
  users[userIndex] = userToUpdate.userToJSON();

  // do we wanna check if any of the keys above are null?

  // Write the updated list back to the JSON file
  await writeJSON(USERS_FILE, users);
}


async function getEvents() {
  return await readJSON(EVENTS_FILE);
}


async function addEvent(event) {
  const events = await getEvents();
  events.push(event);
  await writeJSON(EVENTS_FILE, events);
}


async function editEvent(id, updatedData) {
  const events = await getEvents();
  if (id < 0 || id > events.length) {
    throw new Error('Invalid event id');
  }

  // Replace the existing event at id with new data
  events[id - 1] = { ...events[id-1], ...updatedData };

  await writeJSON(EVENTS_FILE, events);
}

async function eventJoin(eventId, userId) {
  const events = await getEvents();
  const users = await getUsers();
  const event = events.find(e => e.id === parseInt(eventId));
  const user = users.find(u => u.id === parseInt(userId));

  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Initialize arrays if they are undefined - but they most likely will be defined
  if (!Array.isArray(event.usersJoined)) {
    event.usersJoined = [];
  }
  if (!Array.isArray(user.eventsJoined)) {
    user.eventsJoined = [];
  }

  // Check if user already joined
  if (event.usersJoined.includes(user.id)) {
    const err = new Error('You have already joined this event');
    err.status = 400;
    throw err;
  }

  // Add user to event's list
  event.usersJoined.push(user.id);
  event.currentParticipants = (parseInt(event.currentParticipants) + 1).toString();

  // Add event to user's list
  user.eventsJoined.push(event.id);

  // Save updated data
  await writeJSON(EVENTS_FILE, events);
  await writeJSON(USERS_FILE, users);
}

async function eventLeave(eventId, userId) {
  const events = await getEvents();
  const users = await getUsers();

  // this will be mutating these objects inside the array
  const event = events.find(e => e.id === parseInt(eventId));
  const user = users.find(u => u.id === parseInt(userId));

  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Check if user joined the event
  if (event.usersJoined.includes(user.id)) {
    // Remove user from event's list
    event.usersJoined.splice(event.usersJoined.indexOf(user.id), 1);
    event.currentParticipants = (parseInt(event.currentParticipants) - 1).toString();
  
    // Remove event from user's list
    user.eventsJoined.splice(event.id, 1);
  }
  else {
    const err = new Error('You have not joined this event');
    err.status = 400;
    throw err;
  }

  await writeJSON(EVENTS_FILE, events);
  await writeJSON(USERS_FILE, users);
}

async function deleteEvent(eventId, userId) {
  const events = await getEvents();
  const eventIndex = events.findIndex(e => e.id === parseInt(eventId));
  if (eventIndex === -1) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  if (events[eventIndex].userId !== userId) {
    const err = new Error('Unauthorized: You are not the creator of this event');
    err.status = 403;
    throw err;
  }

  // remove the event from any users who joined it
  const users = await getUsers();
  for (const user of users) {
    if (Array.isArray(user.eventsJoined) && user.eventsJoined.includes(parseInt(eventId))) {
      user.eventsJoined.splice(eventId, 1);
    }
  }
  
  events.splice(eventIndex, 1);
  
  await writeJSON(USERS_FILE, users);
  await writeJSON(EVENTS_FILE, events);
}


module.exports = { getUsers, getUserById, addUser, editUser, getEvents, addEvent, editEvent, eventJoin, eventLeave, deleteEvent };
