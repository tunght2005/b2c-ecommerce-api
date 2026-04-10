const orderService = require('./order.service');

const orderController = {
    // 1. API Tạo đơn hàng
    createOrder: async (req, res) => {
        try {
            const user_id = req.user.id; // Lấy từ token đăng nhập
            
            // CHỈ NHẬN address_id VÀ voucher_id (Tuyệt đối không nhận discount_price từ Frontend nữa)
            const { address_id, voucher_id } = req.body;

            // Kiểm tra xem FE có gửi address_id lên không
            if (!address_id) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Vui lòng cung cấp address_id (địa chỉ giao hàng)" 
                });
            }

            // Gọi service tạo đơn (chỉ truyền user_id, address_id, voucher_id)
            const order = await orderService.createOrder(user_id, address_id, voucher_id);

            res.status(201).json({
                success: true,
                message: "Đặt hàng thành công! Giỏ hàng đã được làm trống.",
                data: order
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // 2. API Lấy danh sách đơn hàng của User
    getUserOrders: async (req, res) => {
        try {
            const user_id = req.user.id;
            const orders = await orderService.getUserOrders(user_id);
            
            res.status(200).json({ 
                success: true, 
                data: orders 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = orderController;