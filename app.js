if(process.env.NODE_ENV != "production"){
  require("dotenv").config(); //abhi hum development process mein isliye use kr rhe hai jaise hi production mein
  //jayenge phir hum env file ko sendnhi krnege kyunki iske andar hmare credentials hote hai
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dbUrl=process.env.ATLASDB_URL
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate= require('ejs-mate');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");
const listingsRouter=require("./routes/listings.js");
const reviewsRouter=require("./routes/review.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const userRouter=require("./routes/user.js");
const {validateReview}=require("./middleware.js");
// require('dotenv').config()


app.engine("ejs",ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600, //ye bar bar login na krna pde ek baar login kiya to 24hrs tak rhega
});

const sessionOptions={
                        store,
                        secret:process.env.SECRET,
                        resave:false,
                        saveUninitialized:true,
                        cookie:{
                          expires:Date.now()*7*24*60*60*1000, //itne time tak store rhega iske badd deleete ho jayega
                          maxAge:7*24*60*60*1000,
                          httpOnly:true //cross scripting ke attack na hone paye uske liye use krte hai
                        },
                    };



store.on("error",()=>{
  console.log("Error is session store",err)
})

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
})



// app.get("/",(req,res)=>{
//     res.send("Hii,I am a root");
// })

async function main(){
    await mongoose.connect(dbUrl);
}

main().then(()=>console.log("Connected to DB")).catch(err=>console.log(err));

// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new Villa",
//         description:"By the Beach",
//         price:1200,
//         location:"Calangoute,Goa",
//         country:"India",
//     })
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// })

// app.get("/listings",async (req,res)=>{
//     const allListings=Listing.find({});
//     res.render("index.ejs",{allListings});
// })

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"delta-student"
//   });

//   let registeredUser= await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);  
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// //validation by using Joi
// const validateListing=(req,res,next)=>{
//   let{error}=listingSchema.validate(req.body);
//   if(error){
//     let errMsg=error.details.map((el)=>el.message).join(",");  //to get details from object
//     throw new ExpressError(400,errMsg);
//   }else{
//     next();
//   }
// }

//Validate Review
// const validateReview=(req,res,next)=>{
//   let{error}=reviewSchema.validate(req.body);
//   if(error){
//     let errMsg=error.details.map((el)=>el.message).join(",");  //to get details from object
//     throw new ExpressError(400,errMsg);
//   }else{
//     next();
//   }
// }
// //Index Route
// app.get("/listings", async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
//   });

  
// //New Route
// app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs");
//   });
  
//   //Show Route
//   app.get("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs", { listing });
//   }));
  
//   //Create Route
//   app.post("/listings",validateListing, wrapAsync(async (req, res) => {
//     // if(!req.body.listing){   //agar req.body.listing ke andar koi data nhi hai nichewla display hoga
//                                  //har ek filed ko check krne ke liye !description.listing aisa code bulky ho jayega     
//     //   throw new ExpressError(400,"Send valid data for listings")
//     // }
//     // let result=listingSchema.validate(req.body);
//     // if(result.error){
//     //   throw new ExpressError(400,result.error);
//     // }
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
//   }));

//   //Edit Route
// app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
//     // res.redirect("/listings");
//   }));
  
//   //Update Route
//   app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
//     // if(!req.body.listing){
//     //   throw new ExpressError(400,"Send valid data for listings")
//     // }
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect(`/listings/${id}`);
//   }));

//   //Delete Route
//     app.delete("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
//   }));

  //Reviews
  //post Route
  app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req,res)=>{
   let listing =await Listing.findById(req.params.id);
   let newReview=new Review(req.body.review);

   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();

   res.redirect(`/listings/${listing._id}`)
  }));

  //Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync (async (req,res)=>{
  let {id,reviewId} = req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`)
}))

  app.use((err,req,res,next)=>{
    let{statusCod=500,message="Something Went Wrong"}=err;
    res.status(statusCod).render("error.ejs",{message});
  })

//agar upar alawa koi nhi route pr jayega to error aayega
  app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found"))
  })
