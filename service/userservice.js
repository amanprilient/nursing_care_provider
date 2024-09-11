const { serviceModel } = require("../model/service.model");
const { userModel } = require("../model/user.model")

exports.findUserById = async (id)=> {
    try {
        let user = await userModel.findById(id);
        if(!user){
            return {success:false,message:"User not found!", data:{}}
        }else{
            return {success:true,message:"User found!", data:user}
        }
    } catch (error) {
        return {success:false,message:error.message, data:{}}
    }
}
exports.findUserByService = async (service_id)=> {
    try {
        let user = await userModel.find({
            'pricing.serviceId':{$in:[service_id]},
            is_enable:true,
            $or:[{user_type:'agency'},{user_type:'individual'}]
        }).populate({
            path: 'pricing.serviceId', // Populating the serviceId field
            model:serviceModel
          });
        if(user.length == 0){
            return {success:false,message:"No providers available", data:{}}
        }else{
            return {success:true,message:"providers found!", data:user}
        }
    } catch (error) {
        return {success:false,message:error.message, data:{}}
    }
}