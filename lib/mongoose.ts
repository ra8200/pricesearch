import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URI) return console.log('MONGODB_URI not defined');

    if(isConnected) return console.log('=> using existing database connection');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log(error)
    }
}
