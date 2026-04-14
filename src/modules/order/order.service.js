const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Voucher = require('../voucher/voucher.model'); 
const voucherService = require('../voucher/voucher.service'); // NHÚNG THÊM ĐỂ TÍNH TIỀN

const orderService = {
    // 1. Tạo đơn hàng mới từ Giỏ hàng (Đã bỏ tham số discount_price)
    createOrder: async (user_id, address_id, voucher_id = null) => {
        // Lấy giỏ hàng và ÉP Mongoose lấy thông tin Variant
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

        // 🟢 BẮT ĐẦU TÍNH TOÁN TIỀN GIẢM GIÁ TẠI BACKEND
        let discount_price = 0;
        if (voucher_id) {
            const voucher = await Voucher.findById(voucher_id);
            if (!voucher) {
                throw new Error("Mã giảm giá không tồn tại hoặc không hợp lệ.");
            }
            
            // Tận dụng lại hàm calculateDiscount để check hạn sử dụng, lượt dùng, đơn tối thiểu...
            const discountResult = await voucherService.calculateDiscount(voucher.code, total_price);
            discount_price = discountResult.discount_amount;
        }

        const final_price = total_price - discount_price;

        // Tạo Document Order mới
        const newOrder = new Order({
            user_id,
            address_id,
            items: orderItems,
            total_price,
            discount_price,
            voucher_id, 
            final_price
        });

        // Lưu đơn hàng vào database
        await newOrder.save();

        // Tăng số lượt sử dụng voucher lên 1
        if (voucher_id) {
            await Voucher.findByIdAndUpdate(voucher_id, {
                $inc: { used_count: 1 }
            });
        }

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
                select: 'sku' // Chỉ lấy mã SKU cho nhẹ
            })
            .populate({
                path: 'voucher_id',
                select: 'code discount_type discount_value' 
            });
    },

    // 3. Xác nhận đơn hàng (admin xác nhận trước khi gán shipper)
    confirmOrder: async (order_id) => {
        const order = await Order.findById(order_id)
        if (!order) {
            throw new Error('Order không tồn tại')
        }

        if (order.status !== 'pending') {
            throw new Error(`Order đang ở trạng thái '${order.status}', không thể xác nhận`)
        }

        order.status = 'confirmed'
        await order.save()

        return order
    }
};

module.exports = orderService;