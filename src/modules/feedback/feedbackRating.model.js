const mongoose = require('mongoose')

const feedbackRatingSchema = new mongoose.Schema(
  {
    feedback_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: { type: String, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model('FeedbackRating', feedbackRatingSchema)
