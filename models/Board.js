import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  columns: [{
    name: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#3B82F6'
    }
  }],
  cards: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId
    },
    assignees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    labels: [{
      type: String,
      trim: true
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: {
      type: Date
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
boardSchema.index({ project: 1 });

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Board) {
  delete mongoose.models.Board;
}

export default mongoose.model('Board', boardSchema);
