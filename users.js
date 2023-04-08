const moment = require('moment');
let users = [];

const saveUser = (userName, room, id) => {
  const user = { userName, room, id };
  users.push(user);
};

const messageFormat = (userName, text) => {
  return {
    userName,
    text,
    time: moment().format('HH:mm'),
  };
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};
const getUserInRoom = () => {
  return users;
};

const getRooms = () => {
  const rooms = [...new Set(users.map((user) => user.room))];
  return rooms;
};

const removeUser = (id) => {
  users = users.filter((user) => user.id !== id);
};
module.exports = { saveUser, messageFormat, getUser, getUserInRoom, getRooms, removeUser };
