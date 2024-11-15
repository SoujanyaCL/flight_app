//npm install express mongoose cors body-parser
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

var app = express();
app.use(cors());

var mongoDB = 'mongodb://127.0.0.1:27017/MyDB';
mongoose.connect(mongoDB).then((data)=>{
    console.log("DB Connection is succesful...");
}).catch((err)=>{
    console.log("DB Connection failed",err);
})

var db = mongoose.connection;

db.on('error',console.error.bind(console,'MongoDB connection error'));

app.listen(8001,function (reg,res){
    console.log("Server is listening at http://localhost:8001");
})

// Define the Schema


var Schema = mongoose.Schema;         //var schema is defined
var FlightsSchema = new Schema ({
    "id":Number,
    "airline":String,
    "source":String,
    "destination":String,
    "fare":Number,
    "duration":String
});

const FlightsTable = mongoose.model('Flights',FlightsSchema);

app.use(express.json());
//Get all the flights
app.get("/getAllflights",function(req,res){
    FlightsTable.find().then((data)=>{
        console.log(data)
        res.status(200).send(data)
    }).catch(err => {
        res.status(400).send(err);
    });
});

// For inserting a record in the table.
app.use(express.json());
app.post("/insertData", async function (req,res) {
    const id = req.body.id;
    const airline = req.body.airline;
    const source = req.body.source;
    const destination = req.body.destination;
    const fare = req.body.fare;
    const duration = req.body.duration;

    var flightsObj = new FlightsTable ({
        "id": id,
        "airline": airline,
        "source": source,
        "destination": destination,
        "fare": fare,
        "duration": duration
    })

    const result = await flightsObj.save();
    try {
        res.status(201).json({
            message: "Record inserted successfully",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            message: "error inserting record"
        });
    }

});

// Update a flight record by ID
app.put("/updateFlight/:id", async (req, res) => {
    const { id } = req.params; 
    const { airline, source, destination, fare, duration } = req.body;

    try {
        const updateFlight = await FlightsTable.updateOne(
            { id: id }, 
            { airline, source, destination, fare, duration }
        );

        if (!updateFlight) {
            return res.status(404).json({ 
                error: "Flight not found" 
            });
        }

        res.status(200).json({
            message: "Flight updated successfully",
            data: updateFlight
        });
    } 
    catch (err) {
        res.status(500).json({ 
            error: "Error updating flight"
        });
    }
});

// Delete a flight record by ID

app.delete("/deleteFlight/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Find the flight by custom `id` field and delete it
        const deletedFlight = await FlightsTable.findOneAndDelete({ id });

        if (!deletedFlight) {
            return res.status(404).json({ error: "Flight not found" });
        }

        res.status(200).json({
            message: "Flight deleted successfully",
            data: deletedFlight,
        });
    } catch (err) {
        res.status(500).json({ error: "Error deleting flight", details: err });
    }
});



