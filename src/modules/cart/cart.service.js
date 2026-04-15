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
    },

    // 4. [MỚI] Chỉnh sửa số lượng sản phẩm trong giỏ hàng
    updateItemQuantity: async (user_id, variant_id, quantity) => {
        // Xử lý thông minh: Nếu user giảm số lượng về 0 hoặc số âm -> Tự động xóa sản phẩm đó
        if (Number(quantity) <= 0) {
            return await cartService.removeFromCart(user_id, variant_id);
        }

        const cart = await Cart.findOne({ user_id });

        if (!cart) {
            throw new Error("Giỏ hàng không tồn tại");
        }

        // Tìm vị trí của sản phẩm trong giỏ hàng
        const itemIndex = cart.items.findIndex(
            item => item.variant_id.toString() === variant_id.toString()
        );

        if (itemIndex > -1) {
            // Đã tìm thấy -> GHI ĐÈ số lượng mới (chứ không cộng dồn như addToCart)
            cart.items[itemIndex].quantity = Number(quantity);
            await cart.save();
        } else {
            throw new Error("Sản phẩm không có trong giỏ hàng để cập nhật");
        }

        // Tìm lại và populate để trả dữ liệu đầy đủ về cho Frontend
        return await Cart.findOne({ user_id }).populate({
            path: 'items.variant_id',
            model: 'Variant'
        });
    }
};

module.exports = cartService;