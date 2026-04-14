const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    method: {
        type: String,
        enum: ['VNPAY', 'MOMO', 'COD'],
        default: 'VNPAY'
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    vnp_TransactionNo: { // Mã giao dịch do VNPAY trả về sau khi thành công
        type: String, 
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);