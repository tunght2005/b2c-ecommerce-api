const requireRole = (...roles) => {
  const allowedRoles = roles.flat()

  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Bạn không có quyền truy cập, cần role: ${allowedRoles.join(' hoặc ')}`
      })
    }
    next()
  }
}

module.exports = requireRole
