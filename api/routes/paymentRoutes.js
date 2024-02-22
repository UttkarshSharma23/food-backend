const express = require('express')
const mongoose = require('mongoose');
const router = express.Router();

const Payment = require('../models/Payments')
const Cart =require('../models/Carts');
const ObjectId = mongoose.Types.ObjectId
// Token Verification
const verifyToken = require("../middleware/verifyToken");

//Post Payment to db
// Verify token and remove the items from cart after successful payemnt
router.post('/',verifyToken,async (req,res)=>{
    const payment = req.body;
    try{
        const paymentRequest  = await Payment.create(payment);
        // delete Cart after payment
        const cartIds = payment.cartItems.map(id => new ObjectId(id));

        const deleteCartRequest = await Cart.deleteMany({_id:{$in:cartIds}})
        res.status(200).json({paymentRequest, deleteCartRequest})
    }catch(error){
        res.status(404).json({message:error.message})
    }
})

router.get('/',verifyToken,async (req,res)=>{
    const email = req.query.email;
    const query = {email:email}
    try
    {
        const decodedEmail = req.decoded.email;
        if(email !== decodedEmail)
        {
            res.status(403).json({message:"Forbiden Access"})
        }
        const result = await Payment.find(query).sort({createdAt: -1}).exec();
        res.status(200).json(result);
    }
    catch(error)
    {
        res.status(404).json({message:error.message});
    }
});

// Get All payments
router.get('/all',async(req,res)=>{
    try{
        const payments = Payment.find({}).sort({createdAt: -1}).exec();
        res.status(200).json(payments);

    }catch(error){
        res.status(404).json({message: error.message});
    }
})

// confirm payments status

router.patch('/:id',async(req,res)=>{
    const payId = req.params.id;
    const {status} = req.body;

    try{
        const updateStatus = await Payment.findByIdAndUpdate(payId,{status:"Confirmed"},{new:true, runValidators:true})
        if(!updateStatus){
            return res.status(404).json({message:"Payment Not Found"})
        }
        res.status(200).json(updateStatus)

    }catch(error){
        res.status(404).json({message:error.message})
    }
})


module.exports = router;