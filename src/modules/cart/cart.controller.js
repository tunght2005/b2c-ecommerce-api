const cartService = require('./cart.service');

const cartController = {
    // 1. Hàm lấy giỏ hàng
    getCart: async (req, res) => {
        try {
            const user_id = req.user.id; 
            const cart = await cartService.getCartByUserId(user_id);
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Hàm thêm vào giỏ hàng
    addToCart: async (req, res) => {
        try {
            const user_id = req.user.id;
            const { variant_id, quantity } = req.body;

            const updatedCart = await cartService.addToCart(user_id, variant_id, quantity);
            
            res.status(200).json({ 
                success: true, 
                message: "Đã thêm vào giỏ hàng", 
                data: updatedCart 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Hàm xóa khỏi giỏ hàng (Chính là hàm đang bị thiếu gây ra lỗi đỏ)
    removeFromCart: async (req, res) => {
        try {
            const user_id = req.user.id; 
            const { variant_id } = req.body; 

            const updatedCart = await cartService.removeFromCart(user_id, variant_id);

            res.status(200).json({
                success: true,
                message: "Đã xóa sản phẩm khỏi giỏ",
                data: updatedCart
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = cartController;