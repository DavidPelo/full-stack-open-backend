const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');
const Contact = require('./models/contact.model');

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
  Contact.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => {
      next(error);
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
  Contact.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(err => next(err));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const contact = {
    name: body.name,
    number: body.number,
  };

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then(updatedContact => {
      response.json(updatedContact);
    })
    .catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
