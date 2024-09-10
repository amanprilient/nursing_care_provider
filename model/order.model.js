const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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
        // required:[true, 'Transaction Id is required.'],
        // unique:true
    },
    order_id:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:[true, "Amount is required"]
    },
    status:{
        type:String,
        // enum:["pending", "success", "failed", "cancelled"],
        // required:[true, "Status is required"],
    },
    payment_method:{
        Type:String,
        enum:['UPI', "credit_card", "debit_card", "net_banking"]
    },
    transaction_date:{
        type:Date,
        // required:[true, "Transaction Date is required."],
        default: new Date()
    },
    invoice_url:{
        type:String
    },
    gateway_response:{
        type:mongoose.Schema.Types.Mixed,
        // required:[true, "Transaction Date is required."]
    }

});

var orderModel = mongoose.model("order",orderSchema );
module.exports = { orderModel }