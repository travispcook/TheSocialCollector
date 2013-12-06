var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , request = require('request')
  , GoogleStrategy = require('passport-google').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy;

//Facebook IDs
var FACEBOOK_APP_ID = "662814087096037";
var FACEBOOK_APP_SECRET = "a493b80dafb23c0081b88e91b99e956c";
var FB = require('fb');

//Google IDs


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


//Facebook auth setup

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://www.thesocialcollector.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   profile.accessToken = accessToken;
    process.nextTick(function () {
     //creates user for Facebook
      return done(null, profile);
    });
  }));

/*
passport.use(new FacebookStrategy({
    profileFields: ['id', 'displayName', 'photos', 'pic_square']
  }));
*/


//Google auth setup
passport.use(new GoogleStrategy({
    returnURL: 'http://www.thesocialcollector.com/auth/google/return',
    realm: 'http://www.thesocialcollector.com/'
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

var app = express();

// Configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  console.log(req.user);
  res.render('index', {user: req.user});
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

//facebook auth
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope:
    ['user_friends', 'user_likes', 'user_events', 'user_status',
     'friends_status', 'publish_actions', 'publish_stream', 'read_stream', 'export_stream', 'status_update', 'photo_upload',
      'video_upload', 'create_note', 'share_item']
    }),
  function(req, res){
  });
app.get('/auth/facebook',
  passport.authenticate('facebook', { display: 'popup' }));


//facebook auth callback
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


//Google auth
app.get('/auth/google',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

//Google auth callback(return)
app.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//pull facebook home feed

app.get('/facebook/feeds', ensureAuthenticated, function(req, res){
  var accessToken = req.user.accessToken;
  var feed_url = 'https://graph.facebook.com/me/home?access_token='+accessToken+'&limit=15';
  var http = require('http');
  var https = require('https');


  request.get(feed_url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var feedItems = JSON.parse(body);

    console.log(feedItems); // Print the web page.
    res.send(feedItems);
    }
  });
});

//Google home feed conflicting with facebook OAuth....will resolve

// app.get('/google/feeds', ensureAuthenticated, function(req, res){
//   var accessToken = req.user.accessToken;
//   var feed_url = 'https://www.googleapis.com/auth/plus.stream.read';
//   var http = require('http');
//   var https = require('https');


//   request.get(feed_url, function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     var feedItems = JSON.parse(body);

//     console.log(feedItems); // Print the web page.
//     res.send(feedItems);
//     }
//   });
// });



var port = 80;
app.listen(port);
console.log("listening at port " + port);


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/facebook');
}

