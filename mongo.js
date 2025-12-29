const mongoose = require('mongoose');

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const database = 'phonebook'
const url =
`mongodb+srv://fullstackopen:${password}@fullstackopennotes.cirdsfw.mongodb.net/${database}?appName=fullstackopenNotes`

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number
})

const Person = mongoose.model('Person', phonebookSchema)

const connection = (query) => {
  console.log('connecting to', url)
  mongoose.set('strictQuery',false)
  mongoose.connect(url)
  console.log('query', query)
  query()
  console.log('end of connection function')
}

const defaultPersons = [
  { name: 'Arto Hellas', number: '040-123456' },
  { name: 'Ada Lovelace', number: '39-44-5323523' },
  { name: 'Dan Abramov', number: '12-43-234345' },
  { name: 'Mary Poppendieck', number: '39-23-6423122' }
]
switch (process.argv.length) {
  case 3: {
    const persons = () => {
      Person
      .find({})
      .then(persons => {
        if (persons.length === 0) {
          const newPersons = defaultPersons.map(person => {
            return new Person({
              name: person.name,
              number: person.number
            })
          })
          Person
            .insertMany(newPersons)
/*
          for (let person of defaultPersons) {
            console.log('default person, person')
            const newPerson = new Person({
              name: person.name,
              number: person.number
            })
              .save()
*/
            .then(result => {
                console.log('added', result)
            })
            .catch(err => console.log(err) )

          console.log('phonebook is empty')
        } else {
          console.log('phonebook:', persons)
        }
        mongoose.connection.close()
      })
      .catch(err => console.log(err))
    }
    connection(persons)
    break;
  }

  case 4: {
    const findPerson = () => {
      Person
        .find({ name: process.argv[3] })
        .then(result => {
          result.forEach(person => {
            console.log('found person',person)
          })
          mongoose.connection.close()
        })
    }
    console.log('finding person', process.argv[3])
    connection(findPerson)
    break;
  }

  case 5: {
    const newPerson = new Person({
      name: process.argv[3],
      number: process.argv[4],
      id: Math.floor(Math.random()*1000000)
    })

    const addPerson = () => {
      newPerson.save().then(result => {
        console.log('contact added!')
        mongoose.connection.close()
        console.log(result)
      })
    }
    connection(addPerson)
    break;
  }

  default: {
    console.log('Invalid number of arguments',process.argv);
    process.exit(1);
  }
}