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
    console.log("DB Connected for ALL Combinations Seeding");
    try {
        // Clear old buses to make it clean
        await Bus.deleteMany({});
        
        const locations = await Location.find();
        const travels = await Travel.find();
        let owner = await Owner.findOne({ email: 'owner@example.com' });

        // Generate Dates (Next 30 days)
        const dates = [];
        for (let i = 0; i < 30; i++) {
            let d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }

        const dummyBuses = [];
        let counter = 0;

        // Loop over EVERY possible start and end location combination
        for (let i = 0; i < locations.length; i++) {
            for (let j = 0; j < locations.length; j++) {
                if (i === j) continue; // Can't travel from Delhi to Delhi

                const start = locations[i];
                const end = locations[j];

                dates.forEach((date) => {
                    counter++;
                    // Add at least 1-2 buses for EVERY route for EVERY day
                    dummyBuses.push(new Bus({
                        name: `${travels[counter % travels.length].name} Express`,
                        type: counter % 2 === 0 ? 'AC' : 'Delux',
                        busNumber: `IND-${counter}-${i}${j}`,
                        fare: 1000 + (counter % 500),
                        features: ['AC', 'WiFi', 'Charging Point'],
                        description: `Direct bus from ${start.name} to ${end.name}`,
                        seatsAvailable: 40,
                        numberOfSeats: 40,
                        departure_time: '18:00',
                        isAvailable: true,
                        travel: travels[counter % travels.length]._id,
                        startLocation: start._id,
                        endLocation: end._id,
                        journeyDate: date,
                        owner: owner._id,
                        boardingPoints: [`${start.name} Main Stand`],
                        droppingPoints: [`${end.name} Central`]
                    }));
                });
            }
        }

        console.log(`Saving ${dummyBuses.length} buses. Please wait...`);
        for (const b of dummyBuses) {
            await b.save();
        }

        console.log(`Successfully injected ${dummyBuses.length} buses covering ALL city combinations!`);
        process.exit(0);
    } catch(err) {
        console.error("Seeding failed: ", err);
        process.exit(1);
    }
}).catch(err => {
    console.error("Connection failed: ", err);
});
