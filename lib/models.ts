import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    image: String,
    streak: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const WordSchema = new Schema({
    original: { type: String, required: true },
    translation: { type: String, required: true },
    example: String,
    createdAt: { type: Date, default: Date.now },
});

const CollectionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    icon: String,
    color: String,
    words: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model('User', UserSchema);
export const Word = models.Word || model('Word', WordSchema);
export const Collection = models.Collection || model('Collection', CollectionSchema);
