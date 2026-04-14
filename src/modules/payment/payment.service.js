const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');

const paymentService = {
    createVNPAYUrl: (req, order_id, amount) => {
        // Lấy cấu hình từ biến môi trường (.env)
        const tmnCode = process.env.VNP_TMN_CODE; 
        const secretKey = process.env.VNP_HASH_SECRET; 
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL; 

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        // Fix lỗi IP Address khi chạy localhost
        let ipAddr = req.headers['x-forwarded-for'] || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress || 
                     '127.0.0.1';
        if (ipAddr === '::1') {
            ipAddr = '127.0.0.1';
        }

        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': String(order_id), 
            'vnp_OrderInfo': 'Thanh toan don hang ' + String(order_id), 
            'vnp_OrderType': 'other',
            'vnp_Amount': Math.round(Number(amount) * 100), 
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };

        // Sắp xếp object theo chuẩn VNPAY
        vnp_Params = sortObject(vnp_Params);

        // Tạo chữ ký bí mật
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        vnp_Params['vnp_SecureHash'] = signed;
        return vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
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

module.exports = paymentService;