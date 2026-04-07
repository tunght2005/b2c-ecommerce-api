const mongoose = require('mongoose');

// Định nghĩa cấu trúc cho Chi tiết đơn hàng (ORDER_ITEMS)
const orderItemSchema = new mongoose.Schema({
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant',
        required: true
    },
    price: { 
        type: Number, 
        required: true // Bắt buộc lưu giá lúc mua, lỡ sau này shop đổi giá thì lịch sử đơn cũ không bị sai
    },
    quantity: {
        type: Number,
        required: true
    }
}, { _id: false });

// Định nghĩa cấu trúc cho Đơn hàng (ORDERS)
const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    items: [orderItemSchema], // Nhúng giỏ hàng vào đây
    
    total_price: { type: Number, required: true, default: 0 },
    discount_price: { type: Number, default: 0 },
    final_price: { type: Number, required: true, default: 0 },
    
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
        default: 'pending' 
    },
    payment_status: {
        type: String,
        enum: ['unpaid', 'paid', 'failed'],
        default: 'unpaid' 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);