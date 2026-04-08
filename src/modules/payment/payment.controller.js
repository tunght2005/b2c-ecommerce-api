const paymentService = require('./payment.service');
const Order = require('../order/order.model');
const Payment = require('./payment.model');
const qs = require('qs');
const crypto = require('crypto');

const paymentController = {
    // API TẠO LINK THANH TOÁN
    createVNPAYPayment: async (req, res) => {
        try {
            const { order_id } = req.body;
            
            const order = await Order.findById(order_id);
            if (!order) return res.status(404).json({ message: "Không thấy đơn hàng" });

            const newPayment = new Payment({
                order_id: order._id,
                amount: order.final_price,
                method: 'VNPAY'
            });
            await newPayment.save();

            const url = paymentService.createVNPAYUrl(req, order._id.toString(), order.final_price);
            res.status(200).json({ success: true, url });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // API XỬ LÝ KHI VNPAY TRẢ KẾT QUẢ VỀ
    vnpayReturn: async (req, res) => {
        try {
            let vnp_Params = req.query;
            const secureHash = vnp_Params['vnp_SecureHash'];

            // Xóa hash cũ để tính toán lại
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            // Tạo lại chữ ký
            const secretKey = process.env.VNP_HASH_SECRET;
            const sortedParams = sortObject(vnp_Params); 
            const signData = qs.stringify(sortedParams, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            // So sánh chữ ký
            if (secureHash === signed) {
                const orderId = vnp_Params['vnp_TxnRef'];
                const responseCode = vnp_Params['vnp_ResponseCode'];

                if (responseCode === '00') {
                    // ✅ THANH TOÁN THÀNH CÔNG -> Cập nhật Database
                    await Payment.findOneAndUpdate(
                        { order_id: orderId }, 
                        { 
                            status: 'success', 
                            vnp_TransactionNo: vnp_Params['vnp_TransactionNo'] 
                        }
                    );
                    await Order.findByIdAndUpdate(orderId, { 
        payment_status: 'paid',   // Đã thanh toán
        status: 'confirmed'      // Chuyển sang 'Đang xử lý' hoặc 'confirmed' tùy bạn đặt
    });

                    return res.send("Thanh toán thành công và đã cập nhật trạng thái 'paid' trong Database!");
                } else {
                    // ❌ THANH TOÁN THẤT BẠI
                    await Payment.findOneAndUpdate({ order_id: orderId }, { status: 'failed' });
                    return res.send("Thanh toán thất bại hoặc khách đã hủy giao dịch.");
                }
            } else {
                return res.status(400).send("Sai chữ ký bảo mật! Dữ liệu có thể đã bị can thiệp.");
            }
        } catch (error) {
            console.error("Lỗi xử lý vnpayReturn:", error);
            res.status(500).send("Lỗi hệ thống");
        }
    }
};

// HÀM SẮP XẾP CHUẨN (Đã fix triệt để lỗi hasOwnProperty)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        // Mượn hàm Object.prototype an toàn
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = paymentController;