import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: String,
                ref: "User",
                required: true,
            },
        ],

        lastMessage: {
            text: String,
            senderId: {
                type: String,
                ref: "User",
            },
            createdAt: Date,
        },

        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);

ConversationSchema.index({ members: 1 });

export default mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);
