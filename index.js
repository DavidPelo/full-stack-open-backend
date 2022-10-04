require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Contact = require('./models/contact.model');
const app = express();

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);
morgan.token('body', (req, res) => JSON.stringify(req.body));

app.get('/info', (request, response) => {
  Contact.find({}).then(persons => {
    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    `);
  });
});

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts);
  });
});

app.get('/api/persons/:id', (request, response) => {
  Contact.findById(request.params.id).then(person => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    });
  }

  Contact.find({}).then(contacts => {
    if (contacts.find(person => person.name === body.name)) {
      return response.status(400).json({
        error: 'name must be unique',
      });
    }
  
    const contact = new Contact({
      name: body.name,
      number: body.number,
    });
  
    contact.save().then(savedContact => {
      response.json(savedContact);
    });
  });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
