import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'credentials';
    }
  },
  image: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    default: 'credentials',
    enum: ['credentials', 'google', 'github']
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  invitedTeams: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  preferences: {
    theme: {
      type: String,
      default: 'dark',
      enum: ['light', 'dark']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      taskAssignments: {
        type: Boolean,
        default: true
      },
      teamUpdates: {
        type: Boolean,
        default: true
      }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bookmarkedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }]
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ teams: 1 });

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', userSchema);
