const { appointmentModel } = require("../model/appointment.model");

exports.findAppointment = async (user_id, user_type)=> {
    try {
        let findBy = {};
        if(user_type == 'individual' || user_type == 'agency'){
            findBy = { service_provider:user_id }
        }else if (user_type === 'customer') {
            findBy = { customer:user_id }
        }
        let appointment = await appointmentModel.find(findBy).populate([
            ('customer', 'service_provider', 'service')
        ]);
            return {success:true, data:appointment}
        } catch (error) {
        return {success:false, error:error}   
    }
}