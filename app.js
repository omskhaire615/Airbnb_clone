if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listings = require("./models/listing.js");
const path = require("path");
const methodoverride = require("method-override");
const ejsmate = require("ejs-mate");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const http = require("http").Server(app);

const multer  = require('multer');
const {storage} = require("./cloudConflict.js");
const upload = multer({storage});

const listingcontroller = require("./controllers/listing.js");
const reviewController = require("./controllers/reviews.js");
const userController = require("./controllers/users.js");

const dbUrl = process.env.ATLUST_DB_URL;

//this code is coppy from mongoose.jss
main()
.then(()=>{
    console.log("connected to db");
})
.catch((err) =>{
    console.log(err);
});

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"views/data")));
app.use(express.urlencoded({ extended: true}));
app.use(methodoverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto: {
    secret: process.env.SECRET,
    touchAfter: 24 * 3600,
  }
});
store.on("error",()=> {
  console.log("Error in mongo seccion store", err);
});

//we use a seccion it means it is use to make a cooke
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// //this is home page
// app.get("/",(req,res)=>{
//   res.render("data/home.ejs");
// });

app.use(session(sessionOptions));
app.use(flash());

//pasword code
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curentUser = req.user;
  next();
});

app.route("/signup")
.get((userController.renderSignupform))
.post((userController.signup));

app.route("/login")
.get((userController.renderLoginForm))
.post(passport.authenticate('local',{failureRedirect: 'login' , failureFlash: true}) ,
(userController.Login));

app.get("/logout",(userController.logout));



app.route("/listings")
.get((listingcontroller.index))
.post(upload.single('listing[image]'),(listingcontroller.createListing));



//create new route
app.get("/listings/new",(listingcontroller.rendernewform));

app.route("/listings/:id")
.get((listingcontroller.showListing))
.put(upload.single('listing[image]'),(listingcontroller.updateListing))
.delete((listingcontroller.deleteListing ));


  //edit route
app.get("/listings/:id/edit",(listingcontroller.renderEditForm));


//reviews
app.post("/listings/:id/reviews", (reviewController.createReview));

//delete review route
app.delete("/listings/:id/reviews/:reviewId",(reviewController.deleteReview));


//this is port listing code
app.listen(8080, ()=>{
    console.log("server is lestining the port 8080");
});