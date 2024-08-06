const mongoose = require("mongoose");
const review = require("./review");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title:
    { 
        type:String,
        required:true
    },
    description:
    {
        type:String,
    },
    image: {
        url: String,
        filename: String,
      },
    price:
    {
        type:Number,
    },
    location:
    {
        type:String,
    },
    country:{
        type:String,
    },
    reviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listing)=>{
    if(listing){
        await Review.deleteMany({ _id: { $in: listing.reviews}})
    }
});

const Listings = mongoose.model("Listing", listingSchema);
module.exports = Listings;