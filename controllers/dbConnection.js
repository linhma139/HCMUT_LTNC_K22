import mongoose from "mongoose";

const url = "mongodb+srv://dangnguyen106:2ztoLjnhLD8Ka96M@ltnc.et7snu5.mongodb.net/main?retryWrites=true&w=majority&appName=LTNC";

export const connectToDB = async (tryCount = 0) => 
{
    try {
        await mongoose.connect(url);
        console.log('Connected to DB');
    }
    catch(err)
    {
        console.error('Failed to connect to DB', err);
        if (tryCount > 20){
            console.error('Failed to connect to DB after 20 tries', err);
        }
        else await connectToDB(tryCount + 1);
    }
}