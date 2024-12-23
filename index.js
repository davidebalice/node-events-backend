const app = require('express')();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http').Server(app);
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const currentUser = require('./middlewares/currentUser');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;
const cors = require('cors');
const nodemailer = require('nodemailer');
const Message = require('./models/messageModel');
const moment = require('moment');

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200,
  })
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connections successfully');
  })
  .catch((err) => {
    console.error('Errore nella connessione a MongoDB:', err);
  });

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection!');
  process.exit(1);
});

process.on('unchaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Unchaught Exception!');
  process.exit(1);
});

var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var i18n = require('i18n-express');
var urlencodeParser = bodyParser.urlencoded({ extended: true });
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(
  session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1200000,
    },
  })
);
app.use(session({ resave: false, saveUninitialized: true, secret: 'nodedemo' }));

app.use(flash());
app.use(
  i18n({
    translationsPath: path.join(__dirname, 'i18n'),
    siteLangs: ['en', 'it'],
    textsVarName: 'translation',
  })
);
app.use(currentUser);
const authRouter = require('./routers/authRoutes');
app.use('/', authRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try {
    const notifications = await Message.find({ read: false }).limit(2);
    const formattedNotifications = notifications.map((notification) => {
      return {
        ...notification.toObject(),
        createdAt: moment(notification.createdAt).format('DD/MM/YYYY HH:mm'),
      };
    });
    res.locals.notifications = formattedNotifications;
    next();
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
});

app.get('/layouts/', function (req, res) {
  res.render('view', { notifications: formattedNotifications });
});

var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

const eventRouter = require('./routers/eventRoutes');
const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const categoryRouter = require('./routers/categoryRoutes');
const subcategoryRouter = require('./routers/subcategoryRoutes');
const bookingRouter = require('./routers/bookingRoutes');
const messageRouter = require('./routers/messageRoutes');
const eventApiRouter = require('./routers/eventApiRoutes');
const bookingApiRouter = require('./routers/bookingApiRoutes');
const categoryApiRouter = require('./routers/categoryApiRoutes');
const messageApiRouter = require('./routers/messageApiRoutes');

app.use('/api/v1/', eventApiRouter);
app.use('/api/v1/', bookingApiRouter);
app.use('/api/v1/', categoryApiRouter);
app.use('/api/v1/', messageApiRouter);
app.use('/', eventRouter);
app.use('/', userRouter);
app.use('/', reviewRouter);
app.use('/', categoryRouter);
app.use('/', subcategoryRouter);
app.use('/', bookingRouter);
app.use('/', messageRouter);

http.listen(8000, function () {
  console.log('listening on *:8000');
});
