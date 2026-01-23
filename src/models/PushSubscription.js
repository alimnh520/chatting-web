import mongoose from "mongoose";

const PushSchema = new mongoose.Schema({
    userId: String, 
    subscription: Object,
});

export default mongoose.models.PushSubscription || mongoose.model("PushSubscription", PushSchema);
