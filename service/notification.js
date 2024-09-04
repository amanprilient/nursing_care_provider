const { notificationModel } = require("../model/notification.model");
const logger = require("../shared/logger");
const { sendNotification } = require("../shared/util");

exports.save_notification = async (input) => {

    var { user_id, title, body, screenName } = input;

    try {
        const saved = await notificationModel.create({
            user_id, title, body, screenName
        });

        if (saved) {
            return { is_success: true, message: 'Notification saved successfully' }
        }
    }
    catch (e) {
        logger.error('error',e)
        return { is_success: false, message: e }
    }
}
