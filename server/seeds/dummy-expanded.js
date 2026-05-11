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
    console.log("DB Connected for Expanded Seeding");
    try {
        // Clear existing to avoid duplicates if required (optional, but good for clean slate)
        await Bus.deleteMany({});
        await Location.deleteMany({});
        await Travel.deleteMany({});

        // 1. Create Locations
        const cities = [
            { name: 'Delhi', district: 'Delhi' },
            { name: 'Mumbai', district: 'Mumbai' },
            { name: 'Bangalore', district: 'Bangalore' },
            { name: 'Pune', district: 'Pune' },
            { name: 'Chennai', district: 'Chennai' }
        ];
        const locations = await Location.insertMany(cities);
        const [delhi, mumbai, bangalore, pune, chennai] = locations;

        // 2. Create Travels
        const agencies = [
            { name: 'National Travels' },
            { name: 'VRL Travels' },
            { name: 'SRS Travels' },
            { name: 'Sharma Transports' }
        ];
        const travels = await Travel.insertMany(agencies);

        // 3. Create Owner
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

        // 4. Generate Dates (Next 30 days)
        const dates = [];
        for (let i = 0; i < 30; i++) {
            let d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }

        // 5. Create Buses combinations
        const dummyBuses = [];

        // Generate combinations
        dates.forEach((date, i) => {
            // Bangalore to Mumbai
            dummyBuses.push(new Bus({
                name: 'VRL Premium Sleeper', type: 'Suspense AC', busNumber: `KA-11-${i}`,
                fare: 1800, features: ['AC', 'WiFi', 'Charging Point', 'Blanket'],
                description: 'Super Luxury AC Sleeper', seatsAvailable: 30, numberOfSeats: 30, departure_time: '19:30',
                isAvailable: true, travel: travels[1]._id,
                startLocation: bangalore._id, endLocation: mumbai._id,
                journeyDate: date, owner: owner._id,
                boardingPoints: ['Madiwala', 'Yeshwantpur'], droppingPoints: ['Sion', 'Andheri']
            }));

            dummyBuses.push(new Bus({
                name: 'National Express', type: 'AC', busNumber: `MH-22-${i}`,
                fare: 1200, features: ['AC', 'Water Bottle'],
                description: 'Comfortable Semi Sleeper', seatsAvailable: 40, numberOfSeats: 40, departure_time: '21:00',
                isAvailable: true, travel: travels[0]._id,
                startLocation: bangalore._id, endLocation: mumbai._id,
                journeyDate: date, owner: owner._id,
                boardingPoints: ['Anand Rao Circle'], droppingPoints: ['Borivali']
            }));

            dummyBuses.push(new Bus({
                name: 'SRS Scania', type: 'Suspense Delux', busNumber: `MH-33-${i}`,
                fare: 1600, features: ['AC', 'TV', 'Snacks'],
                description: 'Fast and comfortable multi-axle', seatsAvailable: 35, numberOfSeats: 35, departure_time: '18:00',
                isAvailable: true, travel: travels[2]._id,
                startLocation: mumbai._id, endLocation: bangalore._id,
                journeyDate: date, owner: owner._id,
                boardingPoints: ['Borivali', 'Dadar'], droppingPoints: ['Majestic']
            }));

            dummyBuses.push(new Bus({
                name: 'Sharma Volvo', type: 'AC', busNumber: `DL-44-${i}`,
                fare: 2500, features: ['AC', 'WiFi', 'Toilet'],
                description: 'Long distance premium', seatsAvailable: 30, numberOfSeats: 30, departure_time: '15:00',
                isAvailable: true, travel: travels[3]._id,
                startLocation: delhi._id, endLocation: mumbai._id,
                journeyDate: date, owner: owner._id,
                boardingPoints: ['ISBT', 'Dhaula Kuan'], droppingPoints: ['Mumbai Central']
            }));
            
             dummyBuses.push(new Bus({
                name: 'VRL Fast', type: 'Delux', busNumber: `MH-55-${i}`,
                fare: 800, features: ['Charging Point'],
                description: 'Economical travel', seatsAvailable: 45, numberOfSeats: 45, departure_time: '22:00',
                isAvailable: true, travel: travels[1]._id,
                startLocation: pune._id, endLocation: bangalore._id,
                journeyDate: date, owner: owner._id,
                boardingPoints: ['Swargate'], droppingPoints: ['Yeshwantpur']
            }));
        });

        // Insert iteratively to avoid unique slug collisions that happen when bypassing save hooks with insertMany
        for (const b of dummyBuses) {
            await b.save();
        }

        console.log(`Successfully injected massive dummy data! Added ${locations.length} locations, ${travels.length} travels, and ${dummyBuses.length} buses across ${dates.length} days.`);
        process.exit(0);
    } catch(err) {
        console.error("Seeding failed: ", err);
        process.exit(1);
    }
}).catch(err => {
    console.error("Connection failed: ", err);
});
