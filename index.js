require ('dotenv').config()
const express = require("express");
const app = express();
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json());
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('dist'))


// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   }
// ]

// app.get("/info", (request, response) => {
//   const currentTime = new Date(); 
//   const totalContacts = persons.length; 

//   response.send(`
//     <p>Phonebook has info for ${totalContacts} people</p>
//     <p>${currentTime}</p>
//   `);
// });


app.get("/api/persons", (request, response) =>{
    Person.find({}).then(persons =>{
      response.json(persons)
    })
})


app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.json(person)
    })
    .catch(error => next(error)) 
})



app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (!result) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post("/api/persons", (request,response) =>{

  const body = request.body

  Person.findOne({ name: body.name }).then(existingPerson => {
    if (existingPerson) {
      return response.status(409).json({ error: 'name must be unique' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
