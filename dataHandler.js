// import fs from 'fs/promises';
const { fs } = require('fs/promises');

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

async function getEvents() {
  return await readJSON(EVENTS_FILE);
}

async function addEvent(event) {
  const events = await getEvents();
  events.push(event);
  await writeJSON(EVENTS_FILE, events);
}

module.exports = { getUsers, addUser, getEvents, addEvent };
