import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: {
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
    enum: ['task', 'bug', 'story', 'epic', 'subtask'],
    default: 'task'
  },
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress', 'review', 'done', 'cancelled'],
    default: 'todo'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  project: {
    type: String,
    trim: true
  },
  epic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  }],
  labels: [{
    type: String,
    trim: true
  }],
  components: [{
    type: String,
    trim: true
  }],
  fixVersions: [{
    type: String,
    trim: true
  }],
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeTracking: {
    originalEstimate: {
      type: Number, // in seconds
      default: 0
    },
    remainingEstimate: {
      type: Number, // in seconds
      default: 0
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    workLogs: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timeSpent: Number,
      comment: String,
      startedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  linkedIssues: [{
    todo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo'
    },
    linkType: {
      type: String,
      enum: ['blocks', 'is blocked by', 'relates to', 'duplicates', 'is duplicated by'],
      default: 'relates to'
    }
  }],
  customFields: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'multiselect', 'boolean']
    }
  }],
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  storyPoints: {
    type: Number,
    min: 0,
    max: 100
  },
  resolution: {
    type: String,
    enum: ['fixed', 'wont-fix', 'duplicate', 'incomplete', 'cannot-reproduce', 'done']
  },
  environment: {
    type: String
  },
  acceptanceCriteria: [{
    type: String
  }],
  definitionOfDone: [{
    type: String
  }],
  isArchived: {
    type: Boolean,
    default: false
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
todoSchema.index({ assignee: 1 });
todoSchema.index({ reporter: 1 });
todoSchema.index({ team: 1 });
todoSchema.index({ status: 1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ type: 1 });
todoSchema.index({ project: 1 });
todoSchema.index({ sprint: 1 });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ createdAt: -1 });

export default mongoose.models.Todo || mongoose.model('Todo', todoSchema);
