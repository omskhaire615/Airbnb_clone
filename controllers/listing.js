const Listings = require("../models/listing");

module.exports.index = async (req , res)=>{
    const alllistings = await Listings.find({});
    res.render("data/index.ejs",{alllistings});
};

module.exports.rendernewform = (req,res) =>{
    console.log(req.user);
      if(!req.isAuthenticated()) {
        req.flash("error" , "You must be logged to create a listing");
       return  res.redirect("/login");
      }
      res.render("data/new.ejs");
};

module.exports.showListing =  async (req, res) => {
    let { id } = req.params;
    const listing = await Listings.findById(id)
    .populate({
      path: "reviews" , 
      populate: {
        path: "author" ,
      },
    })
    .populate("owner");
    console.log(listing);
    res.render("data/show.ejs", { listing });
  };


module.exports.createListing = async (req,res , next) =>{
    let url = req.file.path;
    let filename = req.file.filename;
    const newlisting =  new Listings(req.body.listing);
    newlisting.image = {url , filename};
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
    console.log(url , ".." , filename);
  };

module.exports.renderEditForm =  async (req,res) => {
    let { id } = req.params;
    const listing = await Listings.findById(id);
    if(!req.isAuthenticated()) {
      req.flash("error" , "You must be logged to create a listing");
     return  res.redirect("/login");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("data/edit.ejs" , {listing , originalImageUrl});
  };

module.exports.updateListing =  async (req,res) => {
    let { id } = req.params;
    let listing = await Listings.findByIdAndUpdate(id ,{...req.body.listing});
    if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url , filename};
      await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  };

  module.exports.deleteListing = async (req,res) =>{
    let { id } = req.params;
    let deletedlisting = await Listings.findByIdAndDelete(id);
    if(!req.isAuthenticated()) {
      req.flash("error" , "You must be logged to create a listing");
     return  res.redirect("/login");
    }
    console.log(deletedlisting);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
  };
  
 