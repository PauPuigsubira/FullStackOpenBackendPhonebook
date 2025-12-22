const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
});

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', phonebookSchema);
module.exports.ObjectId = mongoose.Types.ObjectId;