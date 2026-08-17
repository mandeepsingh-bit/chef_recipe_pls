import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true })

// Runs automatically before a user document is saved.
// Only re-hash the password if it was just set/changed —
// otherwise every unrelated update would re-hash an already-hashed password.
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model("User", userSchema)
