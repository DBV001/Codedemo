const express=require("express");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const listings=require("../routes/listings.js");
const Listing=require("../models/listing.js");
const router=express.Router({mergeParams:true});
const {validateReview,isLoggedin,isReviewAuthor}=require("../middleware.js")
const reviewController=require("../controllers/review");


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
//     let{error}=reviewSchema.validate(req.body);
//     if(error){
//       let errMsg=error.details.map((el)=>el.message).join(",");  //to get details from object
//       throw new ExpressError(400,errMsg);
//     }else{
//       next();
//     }
//   }

//post Route
router.post("/",isLoggedin,validateReview,wrapAsync(reviewController.postReview));
 
   //Delete Review Route
 router.delete("/:reviewId",isLoggedin,wrapAsync (reviewController.deleteReview))

 module.exports=router;