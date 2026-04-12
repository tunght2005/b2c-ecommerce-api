const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: String,
  
    type: {
      type: String,
      enum: {
        values: ['normal', 'flash_sale'],
        message: 'Invalid promotion type'
      },
      required: true
    },
  
    discount_type: {
      type: String,
      enum: ['percent', 'fixed'],
    },
  
    discount_value: Number,
  
    //Freeship
    /*free_ship: {
      type: Boolean,
      default: false
    },
  
    max_shipping_discount: Number, //Giảm tối đa bao nhiêu tiền ship
  
    min_order_value: Number, //Đơn tối thiểu để được freeship*/
  
    priority: {
      type: Number,
      default: 0
    },
  
    start_date: Date,
    end_date: Date,
  
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);