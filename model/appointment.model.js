const mongoose = require("mongoose");
const { userModel } = require("./user.model");

const appointmentSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        // required:[true, "Customer id is required."]
    },
    service_provider:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true, "Service provider id is required."]
    },
    service:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'service',
        required:[true, "Service id is required."]
    },
    price:{
        type:Number,
        required:[true, "price is required."]
    },
    appointment_date:{
        type:Date,
        required:[true, "Appointment date is required."]
    },
    timeSlot:{
        start:{
            type:Date,
            required:[true, "Start time is required."]
        },
        end:{
            type:Date,
            required:[true, "End time is required."]
        }
    },
    status:{
        type:String,
        enum:["pending", "confirmed", "completed", "rejected", "rescheduled"],
        default:"pending"
    },
    payment_status:{
        type:String,
        enum:["pending", "paid", "failed"],
        default:"pending"
    },
    notes:{
        type:String
    },
    reject_reason:{
        type:String
    },
    location:{
        address:{
            type:String,
            required:[true, "Address is required."]
        },
        latitude:{
            type:Number,
            required:[true, "Location(latitude) is required."]
        },
        longitude:{
            type:Number,
            required:[true, "Location(longitude) is required."]
        },
    }
}, { timestamps:true });

var appointmentModel = mongoose.model('appointment', appointmentSchema);
module.exports = { appointmentModel }