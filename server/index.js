const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const MongoStore = require('connect-mongo')(session);
app.use(express.static('client/build'));
const User = require('./auth/authController')(mongoose, bcrypt);
const dbString = 'mongodb+srv://stuti3007:w14E1dmx6wAE1h7i@cluster0.rrvbnsb.mongodb.net/editor'
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://stuti3007:w14E1dmx6wAE1h7i@cluster0.rrvbnsb.mongodb.net/editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sessionStore = MongoStore.create({
    mongoUrl: dbString,
    collectionName: 'session'
    })

    app.use(session({
    secret: "settyl",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
       maxAge: 1000 * 60 * 60 * 24 //Equals 24 hours
    }
    }))

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

const documents = {};

io.on('connection', (socket) => {
  socket.on('join', (documentId) => {
    if (!documents[documentId]) {
      documents[documentId] = {
        content: '',
        users: [],
      };
    }

    socket.join(documentId);
    documents[documentId].users.push(socket.id);

    io.to(documentId).emit('document', documents[documentId]);
  });

  socket.on('update', ({ documentId, content }) => {
    documents[documentId].content = content;
    io.to(documentId).emit('document', documents[documentId]);
  });

  socket.on('disconnect', () => {
    Object.keys(documents).forEach((documentId) => {
      documents[documentId].users = documents[documentId].users.filter(
        (userId) => userId !== socket.id
      );
    });
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
