import { Schema, Model, model, connect } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export interface IUserModel extends Model<IUser> { }

const userSchema: Schema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

export const User: Model<IUser> = model<IUser, IUserModel>('User', userSchema);
