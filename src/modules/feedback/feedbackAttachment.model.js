const mongoose = require('mongoose')

const feedbackAttachmentSchema = new mongoose.Schema(
  {
    feedback_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true
    },
    reply_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackReply'
    },
    filename: { type: String, required: true },
    original_name: { type: String, required: true },
    mime_type: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('FeedbackAttachment', feedbackAttachmentSchema)
