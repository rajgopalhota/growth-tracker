import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  },
  card: {
    type: mongoose.Schema.Types.ObjectId
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['card_created', 'card_moved', 'card_updated', 'card_deleted', 'comment_added', 'assignment_changed'],
    required: true
  },
  details: {
    fromColumn: String,
    toColumn: String,
    cardTitle: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better performance
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ card: 1, createdAt: -1 });

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Activity) {
  delete mongoose.models.Activity;
}

export default mongoose.model('Activity', activitySchema);
