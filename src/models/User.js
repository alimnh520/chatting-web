import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            select: false, // default এ যাবে না
        },

        image: {
            type: String,
        },
        
        imageId: {
            type: String,
        },

        online: {
            type: Boolean,
            default: false,
        },

        lastSeen: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
