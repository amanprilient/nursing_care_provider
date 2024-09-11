const Razorpay = require('razorpay');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const { orderModel } = require('../model/order.model');
const { userModel } = require('../model/user.model');
const { serviceModel } = require('../model/service.model');
const { default: mongoose } = require('mongoose');

// const razorpay = new Razorpay({
//     key_id: process.env.RAZOR_KEY_ID,
//     key_secret: process.env.RAZOR_SECRET_KEY
// });

exports.generateOrder = async (req, res) => {

    var {appointment_id, customer_id, service_provider_id, service_id, amount} = req.body;

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: 'purchase nursing service.'
        });

        const newOrder = new orderModel({
            appointment_id,
            customer_id,
            service_provider_id,
            service_id,
            amount,
            order_id: order.id,
        });


        const saved = await newOrder.save();

        res.status(messages.STATUS_CODE_FOR_DATA_SAVED).json({
            order_details: order,
            data: saved
        });

    }
    catch (error) {
        logger.error(error)
        res.status(500).json({ error: error.message });
    }
}
const generateInvoicePDF = async (order) => {
    const doc = new PDFDocument();

    // Fetch user details from brokerModel
    const user = await userModel.findOne({ _id: order.customer_id });

    // Add header
    doc.fontSize(20).text('Invoice', { align: 'center' });

    // Add customer details (assuming user contains necessary details)
    doc.fontSize(12)
        .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 100)
        .text(`Customer Name: ${user.name}`, 50, 140)
        .text(`Email: ${user.email}`, 50, 160)
        .text(`Mobile Number: ${user.mobile_number}`, 50, 180)
        .text(`City: ${user.city}`, 50, 200)

    // Add line items (assuming order contains plan details)
    let y = 270;
    doc.font('Helvetica-Bold').text('Plan Details', 50, y);
    y += 20;
    // for (let i = 0; i < order.plan_details.length; i++) {
    //     if (order.plan_details[i].count > 0) {
    //         const planDetail = order.plan_details[i];
    //         const plan = await planModel.findById(planDetail.plan_id); // Fetch plan details
    //         if (plan) {
    //             doc.font('Helvetica').text(`Plan Name ${i + 1}: ${plan.plan_name}`, 50, y)
    //                 .text(`Amount: Rs.${plan.amount.toFixed(2)}`, 250, y)
    //                 .text(`Coins: ${plan.coin}`, 450, y);
    //             y += 40; // Increase y position for next plan detail
    //         }
    //     }
    // }
    const service_details = await userModel.findOne({
        _id: order.service_provider_id,
        pricing: { $elemMatch: { serviceId: order.service_id } }
      }, {
        pricing: { $elemMatch: { serviceId: order.service_id } }
      }).populate({
        path: 'pricing.serviceId', // Populating the serviceId field
        model:serviceModel
      });
    if (service_details) {
            doc.font('Helvetica').text(`Service Name ${i + 1}: ${service_details.pricing[0].serviceId.name}`, 50, y)
                .text(`Amount: Rs.${service_details.pricing[0].price}`, 250, y)
            y += 40; // Increase y position for next plan detail
    }

    const total = order.amount;


    y += 20;
    doc.moveTo(50, y).lineTo(400, y).stroke(); // horizontal line
    y += 10;
    doc.font('Helvetica-Bold').text('Total:', 250, y).text('Rs. ' + total.toFixed(2), 350, y, { align: 'right' });


    // Finalize the PDF and return the path
    const outputPath = `./invoices/invoice${order._id}.pdf`;
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    doc.end();  

    return outputPath;
};

const generateInvoice = (order) => {
    // Generate and return invoice path
    return generateInvoicePDF(order);
};

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.SECRET_KEY)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        try {
            const order = await orderModel.findOne({ order_id: razorpay_order_id });

            if (!order) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            const invoicePath = await generateInvoice(order);

            await orderModel.updateOne({ order_id: razorpay_order_id }, { status: 'paid', invoice_url: invoicePath});


            res.status(200).json({ success: true });
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, error: 'Something went wrong' });
        }
    } else {
        res.status(400).json({ success: false, error: 'Signature mismatch' });
    }
};