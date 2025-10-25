import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['resources', 'notes', 'todos', 'goals', 'mixed'],
    default: 'mixed'
  },
  items: [{
    itemType: {
      type: String,
      enum: ['note', 'todo', 'goal', 'resource'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  tags: [{
    type: String,
    trim: true
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'contributor', 'admin'],
      default: 'viewer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
collectionSchema.index({ createdBy: 1 });
collectionSchema.index({ team: 1 });
collectionSchema.index({ type: 1 });
collectionSchema.index({ visibility: 1 });
collectionSchema.index({ createdAt: -1 });

export default mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
