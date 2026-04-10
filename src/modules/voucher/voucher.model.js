const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true,
        uppercase: true // Ép viết hoa (vd: SALE10)
    },
    discount_type: { 
        type: String, 
        enum: ['percentage', 'fixed'], 
        required: true 
    },
    discount_value: { 
        type: Number, 
        required: true 
    },
    min_order_value: { 
        type: Number, 
        required: true,
        default: 0 // Giá trị đơn tối thiểu để được áp mã
    },
    max_discount: { 
        type: Number, 
        default: null // Giảm tối đa (chỉ có tác dụng nếu discount_type là 'percentage')
    },
    quantity: { 
        type: Number, 
        required: true // Tổng số lượt dùng
    },
    used_count: { 
        type: Number, 
        default: 0 // Số lượt đã dùng
    },
    start_date: { 
        type: Date, 
        required: true 
    },
    end_date: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['active', 'expired', 'inactive'], 
        default: 'active' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);