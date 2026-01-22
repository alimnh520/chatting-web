import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
    {
        participants: [
            {
                type: String,
                ref: "User",
                required: true,
            },
        ],

        conversationId: {
            type: String,
            ref: "Conversation",
            default: null,
        },

        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },

        lastMessageSenderId: {
            type: String,
            ref: "User",
            default: null,
        },

        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);

HistorySchema.index({ participants: 1 });

export default mongoose.models.History ||
    mongoose.model("History", HistorySchema);
