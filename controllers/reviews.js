const Listings = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req , res) =>
    {
     let listing = await Listings.findById(req.params.id);
      let newReview = new Review(req.body.review);
      newReview.author = req.user._id;
      console.log(newReview);
      listing.reviews.push(newReview);
    
      await newReview.save();
      await listing.save();
    
      res.redirect(`/listings/${listing._id}`);
    };

module.exports.deleteReview =  async (req , res ) => {
    let { id , reviewId } = req.params;
    if(!req.isAuthenticated()) {
      req.flash("error" , "You must be logged to create a listing");
     return  res.redirect("/login");
    }
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.curentUser._id)) {
      req.flash("error" , "You are not author of this review");
     return  res.redirect(`/listings/${id}`);
    }
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  };
  
 
  