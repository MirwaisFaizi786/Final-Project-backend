// const fs = require('fs');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const express = require('express');
// const Tour = require('../model/tourModel');
// const app = express();

// app.use(express.json());

// dotenv.config();

// const DB = process.env.DATABASE;

// mongoose.connect(DB).then(() => {
//     console.log('Database connected');
// }).catch((err) => {
//     console.log(err);
// })

// const readFile = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');
// const tours = JSON.parse(readFile);

// const importData = async () => {
//     try {
//         await Tour.create(tours);
//         console.log('Data successfully loaded!');
//     } catch (err) {
//         console.log(err);
//     }
//     process.exit();
// }

// const deleteData = async () => {
//     try {
//         await Tour.deleteMany();
//         console.log('Data successfully deleted!');
//     } catch (err) {
//         console.log(err);
//     }
//     process.exit();
// }

// console.log(process.argv);

// if (process.argv[2] === '--import') {
//     importData();
// }else if (process.argv[2] === '--delete') {
//     deleteData();
// }