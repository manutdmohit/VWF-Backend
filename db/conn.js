const mongoose = require('mongoose');

exports.connectMongoose = (url) => {
  return mongoose.connect(url);
};
