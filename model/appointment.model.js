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
    status:{
        type:String,
        enum:["pending", "confirmed", "rejected", "rescheduled", "completed","cancel"],
        default:"pending"
    },
    price:{
        type:Number,
        required:[true, "price is required."]
    },
    appointment_date:{
        type:Date,
        required:[true, "Appointment date is required."],
        validate:{
            validator:function(v){
                return v >= new Date();
            },
            message:"Appointment date is required and can not be in the past."
        }
    },
    timeSlot:{
        start:{
            type:Date,
            required:[true,"Start time is required."],
            validate:{
                validator:function(v){
                    return v >= new Date();
                },
                message:"Start time is required and can not be in the past."
            }
        },
        end:{
            type:Date,
            required:[true, "End time is required."],
            validate:{
                validator:function(v){
                    return v >= new Date();
                },
                message:"End time is required and can not be in the past."
            }
        }
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
    },
    reschedule_date:{ type:Date },
    reschedule_timeSlot:{
        start:{ type:Date },
        end:{ type:Date  }
    },
    appointment_expiry_time:{
        value:{type:Number, default:12},
        unit:{type:String, default:"Hrs"}
    },
    feedback:{
        rating:{
            type:Number,
            min:1,
            max:5
        },
        comment:{
            type:String
        },
        date:{
            type:Date
        }
    }
}, { timestamps:true });


var appointmentModel = mongoose.model('appointment', appointmentSchema);
module.exports = { appointmentModel }