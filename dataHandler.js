// import fs from 'fs/promises';
const fs = require('fs/promises');

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
  return await readJSON(USERS_FILE);
}

async function addUser(user) {
  const users = await getUsers();
  users.push(user);
  await writeJSON(USERS_FILE, users); // save updated users
}


async function editUser(currentUsername, updatedUserInfo) {
  const users = await getUsers();

  // Find the index of the user to edit
  const userIndex = users.findIndex(user => user.username === currentUsername);
  console.log("IN");
  if (userIndex === -1) {
    throw new Error(`User with username "${username}" not found`);
  }

  // Check for unique username/email
  for (const user of users) {
    if (user.username === updatedUserInfo.username && user.username !== currentUsername) {
      throw new Error('Username already taken');
    }
    if (user.email === updatedUserInfo.email && user.username !== currentUsername) {
      throw new Error('Email already taken');
    }
  }

  // Update the user details
  const userToUpdate = users[userIndex];
  if (updatedUserInfo.username) userToUpdate.username = updatedUserInfo.username;
  if (updatedUserInfo.email) userToUpdate.email = updatedUserInfo.email;
  if (updatedUserInfo.password) userToUpdate.password = updatedUserInfo.password;

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

module.exports = { getUsers, addUser, editUser, getEvents, addEvent };
