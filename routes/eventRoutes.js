const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../db");
const multer = require("multer");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get("/events", async (req, res) => {
    try {
        const db = await connectDB();
        const events = db.collection("events");

        const eventId = req.query.id;

        if (!eventId) return res.status(400).json({ error: "Event ID required" });

        const event = await events.findOne({ _id: new ObjectId(eventId) });

        if (!event) return res.status(404).json({ error: "Event not found" });

        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.get("/events", async (req, res) => {
    try {
        const db = await connectDB();
        const events = db.collection("events");

        const { type, limit = 5, page = 1 } = req.query;

        if (type !== "latest")
            return res.status(400).json({ error: "Invalid type. Use type=latest" });

        const skip = (page - 1) * limit;

        const result = await events
            .find({})
            .sort({ schedule: -1 }) 
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.post("/events", upload.single("image"), async (req, res) => {
    try {
        const db = await connectDB();
        const events = db.collection("events");

        const {
            type,
            uid,
            name,
            tagline,
            schedule,
            description,
            moderator,
            category,
            sub_category,
            rigor_rank,
            attendees
        } = req.body;

        const newEvent = {
            type,
            uid,
            name,
            tagline,
            schedule,
            description,
            moderator,
            category,
            sub_category,
            rigor_rank: parseInt(rigor_rank),
            attendees: attendees ? attendees.split(",") : [],
            image: req.file ? req.file.originalname : null,
            created_at: new Date()
        };

        const response = await events.insertOne(newEvent);

        res.status(201).json({
            message: "Event created successfully",
            id: response.insertedId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.put("/events/:id", upload.single("image"), async (req, res) => {
    try {
        const db = await connectDB();
        const events = db.collection("events");

        const eventId = req.params.id;

        const updateData = { ...req.body };

        if (req.file) updateData.image = req.file.originalname;

        if (updateData.rigor_rank)
            updateData.rigor_rank = parseInt(updateData.rigor_rank);

        if (updateData.attendees)
            updateData.attendees = updateData.attendees.split(",");

        const result = await events.updateOne(
            { _id: new ObjectId(eventId) },
            { $set: updateData }
        );

        if (!result.matchedCount)
            return res.status(404).json({ error: "Event not found" });

        res.json({ message: "Event updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// here delete funtion will go 
router.delete("/events/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const events = db.collection("events");

        const eventId = req.params.id;

        const result = await events.deleteOne({ _id: new ObjectId(eventId) });

        if (!result.deletedCount)
            return res.status(404).json({ error: "Event not found" });

        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
