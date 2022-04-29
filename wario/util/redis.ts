import { createClient } from 'redis';
import User, { IUser } from "../models/user";

export const RedisInstance = createClient({ legacyMode: true });

export const setUser = async (user: IUser) => {
    await RedisInstance.set("lud" + user._id, JSON.stringify(user));
}

export const getUser = async (id: string): Promise<IUser | false> => {
    const res = await RedisInstance.get("lud" + id);
    if (res) {
        return JSON.parse(res);
    } else {
        const user = await User.findById(id);
        if (!user) {
            return false;
        } else {
            await RedisInstance.set("lud" + user._id, JSON.stringify(user));
            return user;
        }
    }
}