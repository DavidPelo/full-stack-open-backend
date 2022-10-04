require('dotenv').config();
const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://dpelo:${password}@cluster0.kda7csf.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Contact = mongoose.model("Contact", contactSchema);

if(process.argv.length === 3) {
  retrieveAllContacts();
} else if (process.argv.length === 5) {
  postNewContact();
} else {
  console.log('oopsy something is weird')
}

function postNewContact() {
  const name = process.argv[3];
  const number = process.argv[4];

  mongoose
    .connect(url)
    .then(result => {
      console.log("connected");
  
      const contact = new Contact({
        name: name,
        number: number,
      });
  
      return contact.save();
    })
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook`);
      return mongoose.connection.close();
    })
    .catch(err => console.log(err));
}

function retrieveAllContacts() {
  mongoose.connect(url).then(() => {
    Contact.find({}).then(result => {
      console.log('phonebook:')
      result.forEach(contact=> {
        console.log(contact.name, contact.number)
      })
      mongoose.connection.close()
    })
  })
}


