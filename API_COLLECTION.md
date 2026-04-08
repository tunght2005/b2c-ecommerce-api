# API Collection - Order & Shipment Module

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 AUTHENTICATION

### 1. Register User
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Auth:** Not required
- **Note:** Tạo tài khoản mới với role: `customer`, `admin`, `shipper`, `support`
- **Auto-create:** Nếu role = `shipper`, tự động tạo DeliveryStaff record

**Request Body:**
```json
{
  "username": "shipper123",
  "email": "shipper@example.com",
  "password": "shipper123",
  "phone": "0912345678",
  "role": "shipper"
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "6765a1b2c3d4e5f6g7h8i9j0",
    "username": "shipper123",
    "email": "shipper@example.com",
    "role": "shipper"
  }
}
```

**Note:** Khi role = `shipper`, hệ thống tự động tạo DeliveryStaff với status = 'active'

---

### 2. Login (Get Tokens)
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Auth:** Not required
- **Returns:** `accessToken` + `refreshToken`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Đăng nhập thành công",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6765a1b2c3d4e5f6g7h8i9j0",
    "username": "customer123",
    "email": "customer@example.com",
    "phone": "0912345678",
    "role": "customer",
    "status": "active"
  }
}
```

**⚠️ Error (401):**
```json
{
  "message": "Email hoặc mật khẩu không đúng"
}
```

---

### 3. Refresh Access Token
- **Method:** `POST`
- **Endpoint:** `/auth/refresh-token`
- **Auth:** Not required
- **Note:** Khi `accessToken` hết hạn, dùng `refreshToken` để lấy cái mới

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Logout
- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Auth:** Required (Bearer Token)

**Request Header:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "message": "Đăng xuất thành công"
}
```

---

## 📦 ORDER MODULE

### 5. Create Order
- **Method:** `POST`
- **Endpoint:** `/order/create`
- **Role:** `customer`
- **Auth:** Required

**Request Body:**
```json
{
  "address_id": "6765a1b2c3d4e5f6g7h8i9j0",
  "discount_price": 50000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Đặt hàng thành công! Giỏ hàng đã được làm trống.",
  "data": {
    "_id": "6765a1b2c3d4e5f6g7h8i9j1",
    "user_id": "6765a1b2c3d4e5f6g7h8i9j0",
    "address_id": "6765a1b2c3d4e5f6g7h8i9j2",
    "items": [
      {
        "variant_id": "6765a1b2c3d4e5f6g7h8i9j3",
        "price": 500000,
        "quantity": 2
      }
    ],
    "total_price": 1000000,
    "discount_price": 50000,
    "final_price": 950000,
    "status": "pending",
    "payment_status": "unpaid",
    "createdAt": "2026-04-08T10:00:00Z"
  }
}
```

---

### 6. Get User Orders
- **Method:** `GET`
- **Endpoint:** `/order`
- **Role:** `customer`
- **Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6765a1b2c3d4e5f6g7h8i9j1",
      "user_id": "6765a1b2c3d4e5f6g7h8i9j0",
      "status": "completed",
      "final_price": 950000,
      "items": [
        {
          "variant_id": {
            "_id": "6765a1b2c3d4e5f6g7h8i9j3",
            "sku": "PROD-001-S"
          },
          "quantity": 2
        }
      ],
      "createdAt": "2026-04-08T10:00:00Z"
    }
  ]
}
```

---

### 7. Confirm Order
- **Method:** `PATCH`
- **Endpoint:** `/order/:id/confirm`
- **Role:** `admin`
- **Auth:** Required
- **Status Change:** `pending` → `confirmed`

**URL Example:**
```
PATCH /api/order/6765a1b2c3d4e5f6g7h8i9j1/confirm
```

**Response (200):**
```json
{
  "success": true,
  "message": "Xác nhận đơn hàng thành công",
  "data": {
    "_id": "6765a1b2c3d4e5f6g7h8i9j1",
    "status": "confirmed",
    "total_price": 1000000,
    "final_price": 950000
  }
}
```

---

## 🚚 SHIPMENT MODULE

### 8. Create Delivery Staff
- **Method:** `POST`
- **Endpoint:** `/shipment/delivery-staff`
- **Role:** `admin`
- **Auth:** Required
- **Requirement:** User phải có role `shipper`

**Request Body:**
```json
{
  "user_id": "6765a1b2c3d4e5f6g7h8i9j4",
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "shipper@example.com",
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "6765a1b2c3d4e5f6g7h8i9j5",
    "user_id": "6765a1b2c3d4e5f6g7h8i9j4",
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "email": "shipper@example.com",
    "status": "active"
  }
}
```

---

### 9. List Delivery Staff
- **Method:** `GET`
- **Endpoint:** `/shipment/delivery-staff`
- **Role:** `admin`
- **Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6765a1b2c3d4e5f6g7h8i9j5",
      "user_id": "6765a1b2c3d4e5f6g7h8i9j4",
      "name": "Nguyễn Văn A",
      "status": "active"
    }
  ]
}
```

---

### 10. Assign Shipper (Manual)
- **Method:** `POST`
- **Endpoint:** `/shipment/assign`
- **Role:** `admin`
- **Auth:** Required

**Request Body:**
```json
{
  "order_id": "6765a1b2c3d4e5f6g7h8i9j1",
  "delivery_staff_id": "6765a1b2c3d4e5f6g7h8i9j5",
  "expected_delivery_at": "2026-04-10T18:00:00Z",
  "note": "Giao trước 18h"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "6765a1b2c3d4e5f6g7h8i9j6",
    "order_id": "6765a1b2c3d4e5f6g7h8i9j1",
    "delivery_staff_id": "6765a1b2c3d4e5f6g7h8i9j5",
    "status": "assigned",
    "assigned_at": "2026-04-08T10:15:00Z"
  }
}
```

---

### 11. Auto Assign Shipper (Load Balancing) ⭐
- **Method:** `POST`
- **Endpoint:** `/shipment/auto-assign`
- **Role:** `admin`
- **Auth:** Required
- **Feature:** Tự động chọn shipper có **ít việc nhất**
- **Requirement:** Order phải có status `confirmed`

**Request Body:**
```json
{
  "order_id": "6765a1b2c3d4e5f6g7h8i9j1",
  "expected_delivery_at": "2026-04-10T18:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tự động gán shipper thành công",
  "data": {
    "_id": "6765a1b2c3d4e5f6g7h8i9j6",
    "status": "assigned",
    "notes": "Tự động gán cho shipper: Nguyễn Văn A"
  }
}
```

---

### 12. Update Shipment Status
- **Method:** `PATCH`
- **Endpoint:** `/shipment/:id/status`
- **Role:** `admin`, `shipper`
- **Auth:** Required

**Valid State Transitions:**
- `assigned` → `in_transit`, `cancelled`, `failed`
- `in_transit` → `delivered`, `failed`
- `delivered` → (không thể)
- `failed` → `in_transit`

**Shipper Restrictions:**
- Chỉ cho phép: `assigned` → `in_transit` → `delivered`

**Request Body:**
```json
{
  "status": "in_transit",
  "location": "Quận 1, TP.HCM",
  "note": "Đang vận chuyển"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "6765a1b2c3d4e5f6g7h8i9j6",
    "status": "in_transit"
  }
}
```

---

### 13. Get Tracking Logs
- **Method:** `GET`
- **Endpoint:** `/shipment/:id/logs`
- **Role:** `admin`, `shipper`
- **Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6765a1b2c3d4e5f6g7h8i9j7",
      "shipment_id": "6765a1b2c3d4e5f6g7h8i9j6",
      "status": "assigned",
      "location": null,
      "note": "Tự động gán cho shipper: Nguyễn Văn A",
      "createdAt": "2026-04-08T10:15:00Z"
    },
    {
      "status": "in_transit",
      "location": "Quận 1, TP.HCM",
      "createdAt": "2026-04-08T11:00:00Z"
    }
  ]
}
```

---

### 14. Get Assigned Orders
- **Method:** `GET`
- **Endpoint:** `/shipment/assigned-orders`
- **Role:** `shipper`
- **Auth:** Required
- **Note:** Shipper lấy tất cả đơn được gán cho mình

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6765a1b2c3d4e5f6g7h8i9j6",
      "status": "in_transit",
      "order_id": {
        "_id": "6765a1b2c3d4e5f6g7h8i9j1",
        "status": "shipping",
        "final_price": 950000
      }
    }
  ]
}
```

---

## 🔄 COMPLETE FLOW

### Scenario: Customer đặt hàng → Admin xác nhận → Shipper giao

**1️⃣ Customer Register & Login**
```bash
POST /api/auth/register
{
  "username": "customer123",
  "email": "customer@example.com",
  "password": "password123",
  "role": "customer"
}

# Then login
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "password123"
}

# Get: customer_token from response
```

---

**2️⃣ Admin Register & Login**
```bash
POST /api/auth/register
{
  "username": "admin123",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}

POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Get: admin_token
```

---

**3️⃣ Shipper Register & Create Delivery Staff**
```bash
POST /api/auth/register
{
  "username": "shipper123",
  "email": "shipper@example.com",
  "password": "shipper123",
  "role": "shipper"
}

POST /api/auth/login
{
  "email": "shipper@example.com",
  "password": "shipper123"
}

# Get: shipper_token & shipper user_id
# DeliveryStaff đã được tạo tự động với status = 'active'
```

**Note:** Không cần gọi `POST /api/shipment/delivery-staff` nữa vì đã tự động tạo khi register!

---

**5️⃣ Customer Creates Order**
```bash
POST /api/order/create
Authorization: Bearer {customer_token}
{
  "address_id": "...",
  "discount_price": 50000
}

# Order status: pending
# Get: order_id
```

---

**6️⃣ Admin Confirms Order**
```bash
PATCH /api/order/{order_id}/confirm
Authorization: Bearer {admin_token}

# Order status: pending → confirmed
```

---

**7️⃣ Admin Auto Assigns Shipper**
```bash
POST /api/shipment/auto-assign
Authorization: Bearer {admin_token}
{
  "order_id": "{order_id}",
  "expected_delivery_at": "2026-04-10T18:00:00Z"
}

# Shipment created
# Order status: shipping
# Get: shipment_id
```

---

**8️⃣ Shipper Updates to In Transit**
```bash
PATCH /api/shipment/{shipment_id}/status
Authorization: Bearer {shipper_token}
{
  "status": "in_transit",
  "location": "Quận 1, TP.HCM"
}

# Shipment status: in_transit
```

---

**9️⃣ Shipper Marks as Delivered**
```bash
PATCH /api/shipment/{shipment_id}/status
Authorization: Bearer {shipper_token}
{
  "status": "delivered",
  "location": "Quận 1, TP.HCM",
  "note": "Giao hàng thành công"
}

# Shipment status: delivered
# Order status: completed
```

---

## 📋 QUICK API REFERENCE

| # | API | Method | Endpoint | Role | Login Needed | Description |
|---|-----|--------|----------|------|-------------|-------------|
| 1 | Register | POST | `/auth/register` | - | ❌ | Tạo tài khoản (role=shipper tự động tạo DeliveryStaff) |
| 2 | **Login** | POST | `/auth/login` | - | ❌ | Đăng nhập lấy token |
| 3 | Refresh Token | POST | `/auth/refresh-token` | - | ❌ | Làm mới token |
| 4 | Logout | POST | `/auth/logout` | Any | ✅ | Đăng xuất |
| 5 | Create Order | POST | `/order/create` | customer | ✅ | Tạo đơn hàng |
| 6 | Get Orders | GET | `/order` | customer | ✅ | Lấy danh sách đơn |
| 7 | Confirm Order | PATCH | `/order/:id/confirm` | admin | ✅ | Xác nhận đơn (pending→confirmed) |
| 8 | Create Delivery Staff | POST | `/shipment/delivery-staff` | admin | ✅ | Tạo DeliveryStaff thủ công (không cần nếu register role=shipper) |
| 9 | List Delivery Staff | GET | `/shipment/delivery-staff` | admin | ✅ | Danh sách delivery staff |
| 10 | Assign Shipper | POST | `/shipment/assign` | admin | ✅ | Gán shipper thủ công |
| 11 | **Auto Assign** | POST | `/shipment/auto-assign` | admin | ✅ | Gán shipper tự động (load balance) |
| 12 | Update Status | PATCH | `/shipment/:id/status` | admin, shipper | ✅ | Cập nhật trạng thái shipment |
| 13 | Get Logs | GET | `/shipment/:id/logs` | admin, shipper | ✅ | Lấy lịch sử tracking |
| 14 | Get Assigned Orders | GET | `/shipment/assigned-orders` | shipper | ✅ | Lấy đơn được gán |

---

## 📌 IMPORTANT NOTES

- **First step:** Post `/auth/login` để lấy `accessToken`
- **Token prefix:** `Authorization: Bearer {accessToken}`
- **Token expires:** Check lại refresh-token khi hết hạn
- **Load balancing:** `/shipment/auto-assign` tự chọn shipper ít việc
- **Order require:** Phải `confirmed` mới gán shipper
- **Status flow:** pending → confirmed → shipping → completed
