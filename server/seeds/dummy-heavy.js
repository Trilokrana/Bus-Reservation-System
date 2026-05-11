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
    console.log("DB Connected for ALL Combinations Seeding - 8 Buses Per Route");
    try {
        await Bus.deleteMany({});
        
        const locations = await Location.find();
        const travels = await Travel.find();
        let owner = await Owner.findOne({ email: 'owner@example.com' });

        const dates = [];
        for (let i = 0; i < 30; i++) {
            let d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }

        const dummyImages = [
            "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=200",
            "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=200",
            "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&q=80&w=200",
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=200",
            "https://images.unsplash.com/photo-1580970349372-8874f63af3a1?auto=format&fit=crop&q=80&w=200"
        ];

        const busTypes = ['AC', 'Delux', 'Normal', 'Suspense AC', 'Suspense Delux'];
        const dummyBuses = [];
        let counter = 0;

        for (let i = 0; i < locations.length; i++) {
            for (let j = 0; j < locations.length; j++) {
                if (i === j) continue; 

                const start = locations[i];
                const end = locations[j];

                dates.forEach((date) => {
                    // Create 7-8 buses per route per day
                    for(let b = 0; b < 8; b++) {
                        counter++;
                        dummyBuses.push(new Bus({
                            name: `${travels[counter % travels.length].name.split(' ')[0]} Route ${b+1}`,
                            type: busTypes[counter % busTypes.length],
                            busNumber: `IND-${counter}-${i}${j}`,
                            fare: 800 + (b * 150) + (counter % 100),
                            features: b % 2 === 0 ? ['AC', 'WiFi'] : ['Charging Point', 'Water Bottle'],
                            description: `Direct bus from ${start.name} to ${end.name} - Slot ${b+1}`,
                            seatsAvailable: 40 - (b * 2), // random variability
                            numberOfSeats: 40,
                            departure_time: `${10 + b}:00`,
                            isAvailable: true,
                            travel: travels[counter % travels.length]._id,
                            startLocation: start._id,
                            endLocation: end._id,
                            journeyDate: date,
                            owner: owner._id,
                            image: dummyImages[counter % dummyImages.length],
                            boardingPoints: [`${start.name} Point ${b+1}`],
                            droppingPoints: [`${end.name} Drop ${b+1}`]
                        }));
                    }
                });
            }
        }

        console.log(`Saving ${dummyBuses.length} buses. This will take a moment...`);
        // Batch inserting to make it faster
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
