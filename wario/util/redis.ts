import { createClient } from 'redis';
import User, { IUser } from "../models/user";

export const RedisInstance = createClient();

export const setUser = async (user: IUser) => {
    await RedisInstance.set(user._id, JSON.stringify(user));
}

export const getUser = async (id: string): Promise<IUser | false> => {
    const res = await RedisInstance.get(id);
    if (res) {
        return JSON.parse(res);
    } else {
        const user = await User.findById(id);
        if (!user) {
            return false;
        } else {
            await RedisInstance.set(user._id, JSON.stringify(user));
            return user;
        }
    }
}