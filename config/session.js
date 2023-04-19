const MongoDBStore = require("connect-mongo");
const db_url = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
module.exports = sessionConfig = {
  store: MongoDBStore.create({
    mongoUrl: db_url,
    secret,
    touchAfter: 24 * 60 * 60,
  }),
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure:true,  // cookie only used in https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in a week
    magAge: 1000 * 60 * 60 * 24 * 7,
  },
};
