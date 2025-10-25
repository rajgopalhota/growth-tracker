import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canCreateNotes: {
        type: Boolean,
        default: true
      },
      canCreateTodos: {
        type: Boolean,
        default: true
      },
      canCreateGoals: {
        type: Boolean,
        default: true
      },
      canInviteMembers: {
        type: Boolean,
        default: false
      },
      canManageTeam: {
        type: Boolean,
        default: false
      }
    }
  }],
  invitedMembers: [{
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    defaultPermissions: {
      canCreateNotes: {
        type: Boolean,
        default: true
      },
      canCreateTodos: {
        type: Boolean,
        default: true
      },
      canCreateGoals: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ 'invitedMembers.email': 1 });

export default mongoose.models.Team || mongoose.model('Team', teamSchema);
