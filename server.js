require('dotenv').config()

const express = require('express')

const app = express()

const ejs = require('ejs')

const path = require('path')

const expressLayout = require('express-ejs-layouts')

//-----------------------first method-----------------
// the || sign means (or)
const PORT = process.env.PORT || 3300

//-------------------second methoddd--------------------
// if(process.env.PORT)
// {
//     PORT = process.env.PORT
// }
// else
// {
//     PORT = 3000
// }


//------Mongo connection-------------------
const mongoose = require('mongoose')
//const { Console } = require('console')

//--------------Declare session---------------
const session = require('express-session')

const flash  = require('express-flash')
const { options } = require('laravel-mix')

//const { Session } = require('inspector')

//--------------Session store--------------------------
const MongoStore = require('connect-mongo')
const expressEjsLayouts = require('express-ejs-layouts')

//-----------Database connection-----------------------
// const url = 'mongodb://localhost/pizza';
mongoose.connect(process.env.MONGO_CONNECTION_URL , { useNewUrlParser: true , useCreateIndex: true , useUnifiedTopology: true , useFindAndModify: true });
const connection = mongoose.connection;

connection.once('open', () => {
  console.log('Database connected....');
}).catch(err => {
  console.log('Connection faild.....');
})

//----------------Session store------------------
// let Store = new MongoStore({
//   ...options,
//   mongooseConnection: connection,
//   collection: 'sessions'
// })

//---------------------Event emitter---------------------
const Emitter = require('events')
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

//----------------Session config--------------------
app.use(session({
  ...options,
  secret: process.env.COOKIE_SECRET,
  resave: false,
  store: MongoStore.create({mongoUrl: process.env.MONGO_CONNECTION_URL}),
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  //cookie: { maxAge: 1000 * 15 } // 15 sec
}))

//--------------------Passport (middle-ware) config----------------------
const passport = require('passport')
const passportInit = require('./app/config/passport')

passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//------------------------Assets----------------------
app.use(express.static('./public'))

//---------------------Global middleware--------------
app.use((req,res,next) =>{
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})

//------------url encoded for register page-----------------
app.use(express.urlencoded({ extended: false }))

//------------anable json for cart page-----------------
app.use(express.json())

//------------------------set template engine--------------------
app.use(expressLayout)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'resources/views'))

require('./routes/web')(app)
app.use( (req,res ) => {
  res.status(404).render('errors/404')
})

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

//---------------------Socket connection------------------------
const io = require('socket.io')(server)
io.on('connection' , (socket) => {
  //------------Join client-------------------
  console.log(socket.id)
  socket.on('join',(orderId) => {
    //console.log(orderId)
    socket.join(orderId)
  })
})

eventEmitter.on('orderUpdated' , (data) =>{
  io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced' , (data) =>{
  io.to('adminRoom').emit('orderPlaced',data)
})

