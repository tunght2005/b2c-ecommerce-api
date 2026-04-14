const Promotion = require('./promotion.model');
const ProductPromotion = require('./product-promotion.model');
const Variant = require('../variant/variant.model');

// tạo promotion
exports.create = async (data) => {
  return await Promotion.create(data);
};

// validate promotion
const validatePromotion = (promotion) => {
  if (!promotion) throw new Error('Promotion not found');

  if (promotion.status !== 'active') {
    throw new Error('Promotion is not active');
  }

  const now = new Date();

  if (
    (promotion.start_date && now < promotion.start_date) ||
    (promotion.end_date && now > promotion.end_date)
  ) {
    throw new Error('Promotion not in valid time');
  }

  // flash sale check
  if (
    promotion.type === 'flash_sale' &&
    promotion.quantity_limit &&
    promotion.sold >= promotion.quantity_limit
  ) {
    throw new Error('Flash sale sold out');
  }
};

// gán promotion cho product
exports.assignToProduct = async (promotion_id, product_ids) => {
  const promotion = await Promotion.findById(promotion_id);

  validatePromotion(promotion);

  const data = product_ids.map(pid => ({
    promotion_id,
    product_id: pid
  }));

  try {
    return await ProductPromotion.insertMany(data, { ordered: false });
  } catch (err) {
    if (err.code === 11000) {
      return { message: 'Some products already assigned' };
    }
    throw err;
  }
};

// remove promotion khỏi product
exports.removeFromProduct = async (promotion_id, product_id) => {
  return await ProductPromotion.deleteOne({
    promotion_id,
    product_id
  });
};



// list
exports.getAll = async (query) => {

  const filter = {};

  // filter theo type
  if (query.type) {
    filter.type = query.type;
  }

  // filter theo status
  if (query.status) {
    filter.status = query.status;
  }

  return await Promotion.find(filter).sort({ createdAt: -1 });
};

//update
exports.update = async (id, data) => {
  const allowedTypes = ['normal', 'flash_sale'];

  //validate 
  if (data.type) {

    //normalize tránh "flash sale"
    data.type = data.type.trim().toLowerCase().replace(/\s+/g, '_');

    if (!allowedTypes.includes(data.type)) {
      throw new Error(`Invalid type. Allowed: ${allowedTypes.join(', ')}`);
    }
  }
  const promotion = await Promotion.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  if (!promotion) {
    throw new Error('Promotion not found');
  }

  return promotion;
};

// delete 1 promotion
exports.deleteOne = async (id) => {

  const promotion = await Promotion.findById(id);

  if (!promotion) {
    throw new Error('Promotion not found');
  }

  // xoá mapping trước
  await ProductPromotion.deleteMany({
    promotion_id: id
  });

  // xoá promotion
  await Promotion.findByIdAndDelete(id);

  return { id };
};

// lấy promotion active của product (ưu tiên cao nhất)
exports.getBestPromotionByVariant = async (variant_id) => {

  // 1. Lấy variant (giá thật)
  const variant = await Variant.findById(variant_id).lean();

  if (!variant) {
    throw new Error('Variant not found');
  }

  const { product_id, price: variant_price } = variant;

  if (!variant_price || isNaN(variant_price)) {
    throw new Error('Variant price is invalid');
  }

  const now = new Date();

  // 2. Lấy promotion theo product
  const links = await ProductPromotion.find({ product_id })
    .populate({
      path: 'promotion_id',
      match: {
        status: 'active',
        $and: [
          {
            $or: [
              { start_date: null },
              { start_date: { $lte: now } }
            ]
          },
          {
            $or: [
              { end_date: null },
              { end_date: { $gte: now } }
            ]
          }
        ]
      }
    })
    .lean();

  const promotions = links
    .map(l => l.promotion_id)
    .filter(Boolean);

  if (!promotions.length) return null;

  // 3. Tính discount theo variant price
  const getRealDiscount = (p) => {
    const value = Number(p.discount_value) || 0;

    if (p.discount_type === 'percent') {
      return variant_price * (value / 100);
    }

    return value;
  };

  // 4. Normalize
  const normalized = promotions.map(p => ({
    ...p,
    real_discount: getRealDiscount(p),
    priority: p.priority || 0
  }));

  // 5. Sort chuẩn
  normalized.sort((a, b) => {

    // flash sale ưu tiên
    if (a.type === 'flash_sale' && b.type !== 'flash_sale') return -1;
    if (b.type === 'flash_sale' && a.type !== 'flash_sale') return 1;

    // discount lớn hơn
    if (b.real_discount !== a.real_discount) {
      return b.real_discount - a.real_discount;
    }

    // fallback priority
    return b.priority - a.priority;
  });

  const best = normalized[0];

  // 6. Trả luôn giá cuối
  return {
    ...best,
    final_price: Math.max(0, variant_price - best.real_discount),
    original_price: variant_price
  };
};

/*exports.applyShippingPromotion = (shipping_fee, promotion, order_total) => {
    if (!promotion) return shipping_fee;
  
    if (promotion.type !== 'free_ship' && !promotion.free_ship) {
      return shipping_fee;
    }
  
    // check điều kiện đơn hàng
    if (
      promotion.min_order_value &&
      order_total < promotion.min_order_value
    ) {
      return shipping_fee;
    }
  
    // giảm ship
    if (promotion.max_shipping_discount) {
      return Math.max(
        0,
        shipping_fee - promotion.max_shipping_discount
      );
    }
  
    // freeship hoàn toàn
    return 0;
  };*/

