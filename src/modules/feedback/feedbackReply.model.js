const mongoose = require('mongoose')

const feedbackReplySchema = new mongoose.Schema(
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
    content: { type: String, required: true },
    is_internal: { type: Boolean, default: false } // Internal note for support staff
  },
  { timestamps: true }
)

module.exports = mongoose.model('FeedbackReply', feedbackReplySchema)
