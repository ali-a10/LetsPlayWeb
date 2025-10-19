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


async function updateEvent(id, updatedData) {
  const events = await getEvents();
  if (id < 0 || id > events.length) {
    throw new Error('Invalid event id');
  }

  // Replace the existing event at id with new data
  events[id - 1] = { ...events[id-1], ...updatedData };

  await writeJSON(EVENTS_FILE, events);
}


module.exports = { getUsers, addUser, editUser, getEvents, addEvent, updateEvent, writeJSON };
