const Listing=require("../models/listing")

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }

module.exports.renderNewForm= (req, res) => {
    res.render("listings/new.ejs");
  }

module.exports.showlisting=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(! listing){
      req.flash("error","You requested for does not exist");
      res.redirect("/listings")
    }
    res.render("listings/show.ejs", { listing });
  }

module.exports.creatListing=async (req, res,next) => {
    // if(!req.body.listing){   //agar req.body.listing ke andar koi data nhi hai nichewla display hoga
                                 //har ek filed ko check krne ke liye !description.listing aisa code bulky ho jayega     
    //   throw new ExpressError(400,"Send valid data for listings")
    // }
    // let result=listingSchema.validate(req.body);
    // if(result.error){
    //   throw new ExpressError(400,result.error);
    // }
    let url=req.file.path;
    let filename=req.file.filename;
    // console.log(url,"..",filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created")
    res.redirect("/listings");
  }

module.exports.editlisting=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(! listing){
      req.flash("error","You requested for does not exist");
      res.redirect("/listings")
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing,originalImageUrl });
    // res.redirect("/listings");
  };


module.exports.updateListings=async (req, res) => {
    // if(!req.body.listing){
    //   throw new ExpressError(400,"Send valid data for listings")
    // }
    let { id } = req.params;
    const listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success","Listings Updated")
    res.redirect(`/listings/${id}`);
  };


module.exports.deleteListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted");
    res.redirect("/listings");
  }