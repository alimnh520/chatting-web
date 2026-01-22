import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            ref: "Conversation",
            required: true,
        },

        messageId: {
            type: String,
            required: true,
            unique: true,
        },

        senderId: {
            type: String,
            ref: "User",
            required: true,
        },

        receiverId: {
            type: String,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            default: null,
        },

        callType: {
            type: String,
            enum: ["audio", "video"],
            default: null
        },

        callDuration: {
            type: Number,
            default: 0
        },

        file_url: {
            type: String,
            default: null,
        },

        file_id: {
            type: String,
            default: null,
        },
        
        seen: {
            type: Boolean,
            default: false,
        },

        seenAt: {
            type: Date,
        },

        createdAt: {
            type: Date,
        },
    },

    { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message ||
    mongoose.model("Message", MessageSchema);
