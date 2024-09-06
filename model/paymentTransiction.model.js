const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema({
    appointment_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'appointment',
        required:[true, "appointment Id is required."]
    },
    customer_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true, "Customer Id is required."]
    },
    service_provider_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true, "Service Provider Id is required."]
    },
    service_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'service',
        required:[true, "Service Id is required."]    
    },
    transaction_id:{
        type:String,
        required:[true, 'Transaction Id is required.'],
        unique:true
    },
    amount:{
        type:Number,
        required:[true, "Amount is required"]
    },
    status:{
        type:String,
        enum:["pending", "success", "failed", "cancelled"],
        required:[true, "Status is required"]
    },
    payment_method:{
        Type:String,
        enum:['UPI', "credit_card", "debit_card", "net_banking"],
        required:[true, "Payment method is required."]
    },
    transaction_date:{
        type:Date,
        required:[true, "Transaction Date is required."]
    },
    gateway_response:{
        type:mongoose.Schema.Types.Mixed,
        // required:[true, "Transaction Date is required."]
    }

});

var paymentTransactionModel = mongoose.model("paymenttransaction",paymentTransactionSchema );
module.exports = { paymentTransactionModel }