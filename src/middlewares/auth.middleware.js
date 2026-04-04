const { verifyAccessToken } = require('../utils/jwt')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyAccessToken(token)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' })
    }
    return res.status(401).json({ message: 'Token không hợp lệ' })
  }
}

module.exports = authMiddleware
