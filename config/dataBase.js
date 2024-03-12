import mongoose from 'mongoose';


const dbconnection = async function  dataBaseConnection() {
    const params = {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    };
    try {
      mongoose.set("strictQuery", true);
     await mongoose.connect(process.env.MONGO_URL, params);
      console.log("MongoDB connected sucessfully");
    } catch (error) {
      console.log("MongoDB Connection Failed", error);
      process.exit();
    }
  }

  export {dbconnection}