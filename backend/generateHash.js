// D:\PennyWeek\backend\generateHash.js
const bcrypt = require('bcryptjs');
const password = 'khushi#14';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) console.error(err);
  console.log(hash);
});