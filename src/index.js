const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(express.static("dist"));

// Middleware: Logger
const morganLog = (tokens, req, res) => {
  //console.log("body", req.body);
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    tokens.method(req, res) === "POST" ? JSON.stringify(req.body) : "",
  ].join(" ");
};

app.use(morgan(morganLog));

let persons = [
  {
    name: "Arto Helias",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelaces",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramovich",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook back server</h1>");
});

app.get("/info", (request, response) => {
  const text1 = `<p>Phonebook has info for ${persons.length} people</p>`;
  const text2 = `<p>Current date and time ${Date().toString()}</p>`;
  response.send(text1 + text2);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const searchedPerson = persons.find((person) => person.id === id);

  if (!searchedPerson) {
    return response.status(404).end("<p>No contact found</p>");
  }

  response.json(searchedPerson);
});

getPersonId = () => {
  let id = 0;
  persons.length === 0 ? (id = 1) : (id = Math.floor(Math.random() * 999));

  return id;
};

app.post("/api/persons/", (request, response) => {
  console.log("call to post (new/update)");
  const { name, number } = request.body;

  if (!name || !number) {
    return response.status(400).json({ error: "content missing" });
  }

  const existingNumber = persons.find((person) => person.number === number);

  if (existingNumber) {
    return response.status(409).json({ error: "Number already registered" });
  }

  const existingPerson = persons.find((person) => person.name === name);

  if (existingPerson) {
    console.log("existingPerson", existingPerson);
    updatedPerson = { ...existingPerson, number: number };
    persons = persons.map((person) => {
      return person.id !== existingPerson.id ? person : updatedPerson;
    });
    console.log(persons);
    return response.status(206).json(updatedPerson);
  }

  const newPerson = {
    name: name,
    number: number,
    id: getPersonId(),
  };
  console.log("newPerson", newPerson);
  persons = persons.concat(newPerson);
  response.status(201).json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter((person) => person.id !== id);
  console.log("delete id", id, persons);
  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ${Date().toString()}`);
});
