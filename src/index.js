require("dotenv").config();

const express = require("express");
const morgan = require("morgan");

const Person = require("./models/person");
const { ObjectId } = require("./models/person");

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

let persons = [];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook back server</h1>");
});

app.get("/info", (request, response) => {
  const text1 = `<p>Phonebook has info for ${persons.length} people</p>`;
  const text2 = `<p>Current date and time ${Date().toString()}</p>`;
  response.send(text1 + text2);
});

app.get("/api/persons", (request, response) => {
  Person
    .find({})
    .then((persons) => {
      console.log("persons", persons);
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  
  Person
    .findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end("<p>No contact found</p>");
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(400).send({ error: "malformatted id" });
    });
});

app.post("/api/persons/", (request, response) => {
  console.log("call to post (new/update)");
  const { name, number } = request.body;

  if (!name || !number) {
    return response.status(400).json({ error: "content missing" });
  }

  Person
    .find({number: number})
    .then((person) => {
      if (person.length > 0) {
        console.log("persons with number", person);
        return response.status(409).json({ error: "Number already registered" });
        } else {
          console.log('After check for existing number, proceeding to add/update person')
          const filter = { name: name };
          const update = { number: number };
          Person
            .findOneAndUpdate(
              filter, update, { upsert: true }
            )
            .then((result) => {
              if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
              console.log("updatedPerson", result);
              response.status(206).json(result);
              } else {
                console.log("added new person", result);
                response.status(201).json(result);
              }
            })
            .catch((error) => {
              console.log("error adding/updating person:", error);
              response.status(500).json({ error: "error addingupdating person" });
            });        
      }
    });

/*
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
  */
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;

  Person
    .deleteOne({ _id: new ObjectId(id) })
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => {
      console.log(error);
      response.status(400).send({ error: "malformatted id" });
    });
  /*
    persons = persons.filter((person) => person.id !== id);
    console.log("delete id", id, persons);
    response.status(204).end();
  */
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ${Date().toString()}`);
});
