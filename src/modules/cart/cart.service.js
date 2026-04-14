const Cart = require('./cart.model');

const cartService = {
    // 1. Lấy giỏ hàng của user
    getCartByUserId: async (user_id) => {
        return await Cart.findOne({ user_id })
            .populate({
                path: 'items.variant_id',
                model: 'Variant' // Ép nhận diện model Variant
            });
    },

    // 2. Thêm sản phẩm vào giỏ hàng
    addToCart: async (user_id, variant_id, quantity) => {
        let cart = await Cart.findOne({ user_id });

        if (!cart) {
            // Trường hợp 1: User chưa có giỏ hàng -> Tạo mới
            cart = new Cart({
                user_id,
                items: [{ variant_id, quantity }]
            });
        } else {
            // Trường hợp 2: Đã có giỏ hàng -> Tìm xem variant này đã add chưa
            const itemIndex = cart.items.findIndex(
                item => item.variant_id.toString() === variant_id.toString()
            );

            if (itemIndex > -1) {
                // Đã có -> Cộng dồn số lượng
                cart.items[itemIndex].quantity += Number(quantity);
            } else {
                // Chưa có -> Thêm mới vào mảng
                cart.items.push({ variant_id, quantity });
            }
        }

        // Lưu thay đổi vào DB
        await cart.save();

        // TÌM LẠI VÀ POPULATE TRƯỚC KHI TRẢ VỀ CHO FE
        return await Cart.findOne({ user_id }).populate({
            path: 'items.variant_id',
            model: 'Variant' // Ép nhận diện model Variant
        });
    },

    // 3. Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async (user_id, variant_id) => {
        // Toán tử $pull sẽ tìm trong mảng 'items' và xóa phần tử có variant_id tương ứng
        const cart = await Cart.findOneAndUpdate(
            { user_id: user_id },
            { $pull: { items: { variant_id: variant_id } } },
            { new: true } // Trả về document sau khi đã xóa xong
        ).populate({
            path: 'items.variant_id',
            model: 'Variant' // Nhúng data variant luôn ngay lúc trả về
        });

        if (!cart) {
            throw new Error("Giỏ hàng không tồn tại");
        }

        return cart;
    }
};

module.exports = cartService;