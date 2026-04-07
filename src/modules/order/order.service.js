const Order = require('./order.model');
const Cart = require('../cart/cart.model');

const orderService = {
    // 1. Tạo đơn hàng mới từ Giỏ hàng
    createOrder: async (user_id, address_id, discount_price = 0) => {
        // Lấy giỏ hàng và ÉP Mongoose lấy thông tin Variant (giống cách mình fix lỗi Cart lúc nãy)
        const cart = await Cart.findOne({ user_id }).populate({
            path: 'items.variant_id',
            model: 'Variant'
        });

        if (!cart || cart.items.length === 0) {
            throw new Error("Giỏ hàng đang trống, không thể đặt hàng");
        }

        // Tính tổng tiền và chuẩn bị mảng items cho đơn hàng
        let total_price = 0;
        const orderItems = cart.items.map(item => {
            const variantPrice = item.variant_id.price || 0;
            total_price += variantPrice * item.quantity;

            return {
                variant_id: item.variant_id._id,
                price: variantPrice, // Chốt giá ngay tại thời điểm mua
                quantity: item.quantity
            };
        });

        const final_price = total_price - discount_price;

        // Tạo Document Order mới
        const newOrder = new Order({
            user_id,
            address_id,
            items: orderItems,
            total_price,
            discount_price,
            final_price
        });

        // Lưu đơn hàng vào database
        await newOrder.save();

        // Đặt hàng thành công thì dọn sạch giỏ hàng
        cart.items = [];
        await cart.save();

        return newOrder;
    },

    // 2. Lấy danh sách lịch sử đơn hàng của 1 user
    getUserOrders: async (user_id) => {
        return await Order.find({ user_id })
            .sort({ createdAt: -1 }) // Sắp xếp đơn mới nhất lên đầu
            .populate({
                path: 'items.variant_id',
                model: 'Variant',
                select: 'sku' // Chỉ lấy mã SKU cho nhẹ (bạn có thể thêm name, image tùy ý)
            });
            // Nếu bạn đã có file address.model.js thì mở comment dòng dưới để nhúng địa chỉ
            // .populate('address_id'); 
    }
};

module.exports = orderService;