
const dotenv = require('dotenv');
dotenv.config();
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    // Close server and exit process with failure on uncaught exception 
        process.exit(1);
    
})
const app = require('./app');
const { default: mongoose } = require('mongoose');



const PORT = process.env.PORT || 3000;
const DATABASE = process.env.DATABASE;

mongoose.connect(DATABASE).then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.log(err);
})

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    // Close server and exit process with failure on unhandled rejection
    // server.close() is like we give the server time to finish there pending requests before it exits
    server.close(() => {
        process.exit(1);
    })
    
})

