const BannerService = require('./banner.service')

exports.list = async (req, res) => {
  try {
    const { page, limit, position, is_active } = req.query

    const data = await BannerService.list({
      page,
      limit,
      position,
      is_active: is_active ? is_active === 'true' : null
    })

    res.json({
      success: true,
      message: 'Get banners success',
      data
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.create = async (req, res) => {
  try {
    const { title, link, position } = req.body

    const image = req.file ? req.file.path.replace(/\\/g, '/') : null

    const banner = await BannerService.create({
      title,
      image,
      link,
      position
    })

    res.status(201).json({
      success: true,
      message: 'Create banner success',
      data: banner
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const { title, link, position, is_active } = req.body

    const image = req.file ? req.file.path.replace(/\\/g, '/') : null

    const banner = await BannerService.update(id, {
      title,
      image,
      link,
      position,
      is_active: is_active ? is_active === 'true' : undefined
    })

    res.json({
      success: true,
      message: 'Update banner success',
      data: banner
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.remove = async (req, res) => {
  try {
    const { id } = req.params

    await BannerService.remove(id)

    res.json({
      success: true,
      message: 'Delete banner success'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.getById = async (req, res) => {
  try {
    const { id } = req.params

    const banner = await BannerService.getById(id)

    res.json({
      success: true,
      message: 'Get banner success',
      data: banner
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}
