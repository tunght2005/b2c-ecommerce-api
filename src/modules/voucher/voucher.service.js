const Voucher = require('./voucher.model');

const voucherService = {
    // 1. [MỚI] Hàm cho Admin tạo mã giảm giá
    createVoucher: async (voucherData) => {
        // Tạo document mới từ dữ liệu Admin gửi lên
        const newVoucher = new Voucher(voucherData);
        // Lưu vào Database (Mongoose sẽ tự động kiểm tra xem mã code có bị trùng không vì đã set unique: true)
        await newVoucher.save();
        return newVoucher;
    },

    // 2. Hàm tính toán tiền giảm giá cho User (Giữ nguyên)
    calculateDiscount: async (code, cart_total) => {
        // 1. Tìm mã voucher trong Database
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            throw new Error("Mã giảm giá không tồn tại.");
        }

        // 2. Kiểm tra trạng thái và hạn sử dụng
        if (voucher.status !== 'active') {
            throw new Error("Mã giảm giá này không hoạt động.");
        }

        const currentDate = new Date();
        if (currentDate < voucher.start_date) {
            throw new Error("Mã giảm giá này chưa đến thời gian sử dụng.");
        }
        if (currentDate > voucher.end_date) {
            throw new Error("Mã giảm giá này đã hết hạn.");
        }

        // 3. Kiểm tra số lượt dùng
        if (voucher.used_count >= voucher.quantity) {
            throw new Error("Mã giảm giá này đã hết lượt sử dụng.");
        }

        // 4. Kiểm tra điều kiện đơn hàng tối thiểu
        if (cart_total < voucher.min_order_value) {
            throw new Error(`Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã (Tối thiểu: ${voucher.min_order_value.toLocaleString()}đ).`);
        }

        // 5. Tính toán số tiền được giảm
        let discount_amount = 0;

        if (voucher.discount_type === 'fixed') {
            // Trừ thẳng tiền
            discount_amount = voucher.discount_value;
        } else if (voucher.discount_type === 'percentage') {
            // Giảm theo %
            discount_amount = (cart_total * voucher.discount_value) / 100;
            
            // Giới hạn số tiền giảm tối đa (nếu có set max_discount)
            if (voucher.max_discount && discount_amount > voucher.max_discount) {
                discount_amount = voucher.max_discount;
            }
        }

        // Đảm bảo tiền giảm không vượt quá tổng tiền giỏ hàng
        if (discount_amount > cart_total) {
            discount_amount = cart_total;
        }

        const final_price = cart_total - discount_amount;

        return {
            voucher_id: voucher._id,
            discount_amount: discount_amount,
            final_price: final_price
        };
    }
};

module.exports = voucherService;