import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['personal', 'professional', 'health', 'learning', 'financial', 'fitness', 'creative', 'social', 'spiritual', 'other'],
    default: 'personal'
  },
  type: {
    type: String,
    enum: ['short-term', 'long-term', 'milestone', 'habit'],
    default: 'short-term'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused', 'cancelled'],
    default: 'not-started'
  },
  targetDate: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  progressHistory: [{
    progress: Number,
    note: String,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
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
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'contributor', 'owner'],
      default: 'contributor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'comment', 'edit'],
      default: 'read'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedTodos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  }],
  relatedNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  metrics: [{
    name: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    targetValue: Number,
    currentValue: {
      type: Number,
      default: 0
    },
    history: [{
      value: Number,
      date: {
        type: Date,
        default: Date.now
      },
      note: String
    }]
  }],
  habits: [{
    name: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    targetCount: Number,
    streak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    completions: [{
      date: {
        type: Date,
        default: Date.now
      },
      count: {
        type: Number,
        default: 1
      },
      note: String
    }]
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: {
    type: String,
    enum: ['personal', 'professional', 'health', 'learning', 'financial', 'other']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
goalSchema.index({ createdBy: 1 });
goalSchema.index({ team: 1 });
goalSchema.index({ type: 1 });
goalSchema.index({ category: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ priority: 1 });
goalSchema.index({ targetDate: 1 });
goalSchema.index({ createdAt: -1 });

export default mongoose.models.Goal || mongoose.model('Goal', goalSchema);
