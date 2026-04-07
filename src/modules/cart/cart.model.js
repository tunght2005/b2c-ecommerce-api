const mongoose = require('mongoose');

require('../variant/variant.model');
// Định nghĩa cấu trúc cho từng sản phẩm trong giỏ hàng (Cart Item)
const cartItemSchema = new mongoose.Schema({
    variant_id: {
        type: mongoose.Schema.Types.ObjectId, // Hoặc String tùy theo cách bạn định nghĩa variant
        ref: 'Variant',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
}, { _id: false }); // Không tự sinh _id dư thừa cho từng item nhỏ

// Định nghĩa cấu trúc cho Giỏ hàng (Cart)
const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Đảm bảo mỗi user chỉ có 1 giỏ hàng duy nhất
    },
    items: [cartItemSchema] // Nhúng mảng cartItem vào đây
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Cart', cartSchema);