const Banner = require('./banner.model')

exports.list = async ({ page = 1, limit = 10, position = null, is_active = null }) => {
  const query = {}

  if (position) {
    query.position = position
  }

  if (is_active !== null) {
    query.is_active = is_active
  }

  const skip = (page - 1) * limit

  const banners = await Banner.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })

  const total = await Banner.countDocuments(query)

  return {
    banners,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

exports.create = async ({ title, image, link = null, position = 'top' }) => {
  if (!title) {
    throw new Error('Title is required')
  }

  if (!image) {
    throw new Error('Image is required')
  }

  const banner = await Banner.create({
    title,
    image,
    link,
    position
  })

  return banner
}

exports.update = async (id, { title, image, link, position, is_active }) => {
  const banner = await Banner.findById(id)

  if (!banner) {
    throw new Error('Banner not found')
  }

  if (!title) {
    throw new Error('Title is required')
  }

  const updateData = {
    title,
    ...(image && { image }),
    ...(link !== undefined && { link }),
    ...(position && { position }),
    ...(is_active !== undefined && { is_active })
  }

  return await Banner.findByIdAndUpdate(id, updateData, { new: true })
}

exports.remove = async (id) => {
  const banner = await Banner.findById(id)

  if (!banner) {
    throw new Error('Banner not found')
  }

  return await Banner.findByIdAndDelete(id)
}

exports.getById = async (id) => {
  const banner = await Banner.findById(id)

  if (!banner) {
    throw new Error('Banner not found')
  }

  return banner
}
