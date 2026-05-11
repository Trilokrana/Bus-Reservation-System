require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('../models/Location');
const Travel = require('../models/Travel');
const Bus = require('../models/Bus');
const Owner = require('../models/Owner');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("DB Connected for Seeding");
    try {
        // Create Locations
        const delhi = await Location.create({ name: 'Delhi', district: 'Delhi' });
        const mumbai = await Location.create({ name: 'Mumbai', district: 'Mumbai' });
        const bangalore = await Location.create({ name: 'Bangalore', district: 'Bangalore' });

        // Create Travel
        const travels = await Travel.create({ name: 'National Travels' });

        // Create Owner
        let owner = await Owner.findOne({ email: 'owner@example.com' });
        if(!owner) {
            owner = await Owner.create({
                name: 'Test Owner',
                email: 'owner@example.com',
                password: 'password123',
                phone: 1234567890,
                citizenshipNumber: 'ID-12345-ABCD'
            });
        }

        // Create Buses
        await Bus.create({
            name: 'Volvo Sleeper 1',
            type: 'AC',
            busNumber: 'DL-01-1234',
            fare: 1500,
            features: ['AC', 'WiFi', 'Charging Point'],
            description: 'Luxury sleeper bus',
            seatsAvailable: 30,
            numberOfSeats: 30,
            departure_time: '18:00',
            isAvailable: true,
            travel: travels._id,
            startLocation: delhi._id,
            endLocation: mumbai._id,
            journeyDate: new Date().toISOString().split('T')[0],
            owner: owner._id,
            boardingPoints: ['ISBT Kashmiri Gate'],
            droppingPoints: ['Mumbai Central']
        });

        await Bus.create({
            name: 'Scania Delux',
            type: 'Delux',
            busNumber: 'KA-05-9999',
            fare: 1200,
            features: ['AC', 'Water Bottle'],
            description: 'Fast and comfortable',
            seatsAvailable: 30,
            numberOfSeats: 40,
            departure_time: '20:00',
            isAvailable: true,
            travel: travels._id,
            startLocation: mumbai._id,
            endLocation: bangalore._id,
            journeyDate: new Date().toISOString().split('T')[0],
            owner: owner._id,
            boardingPoints: ['Bandra'],
            droppingPoints: ['Majestic']
        });

        console.log("Dummy data injected successfully!");
        process.exit(0);
    } catch(err) {
        console.error("Seeding failed: ", err);
        process.exit(1);
    }
}).catch(err => {
    console.error("Connection failed: ", err);
});
