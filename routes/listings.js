const express=require("express");
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedin,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({storage});

const router=express.Router();


//validation by using Joi
// const validateListing=(req,res,next)=>{
//     let{error}=listingSchema.validate(req.body);
//     if(error){
//       let errMsg=error.details.map((el)=>el.message).join(",");  //to get details from object
//       throw new ExpressError(400,errMsg);
//     }else{
//       next();
//     }
//   }
  
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
  //Index Route
  router.get("/", wrapAsync(listingController.index));
  
  // router.post("/",(req,res)=>{
  //   res.send(req.file);
  // })
    
  //New Route
  router.get("/new",isLoggedin,listingController.renderNewForm);
    
    //Show Route
    router.get("/:id", wrapAsync(listingController.showlisting));
    
    //Create Route
    router.post("/",isLoggedin,upload.single("listing[image]"),validateListing, wrapAsync(listingController.creatListing));
  
    //Edit Route
  router.get("/:id/edit",isLoggedin,isOwner, wrapAsync(listingController.editlisting));
    
    //Update Route
    router.put("/:id",isLoggedin,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListings));
  
    //Delete Route
      router.delete("/:id",isLoggedin,isOwner, wrapAsync(listingController.deleteListing));


    module.exports=router;