import { Router } from 'express';
import { getDb } from '../db/mongo.js';
import { ObjectId } from 'mongodb';

const router = Router();

// GET /api/riddles - קבל את כל החידות
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const riddles = await db.collection('riddles').find({}).toArray();
    res.status(200).json(riddles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch riddles', error: error.message });
  }
});

// POST /api/riddles/riddle - הוסף חידה חדשה
router.post('/riddle', async (req, res) => {
  try {
    const { question, answer, level } = req.body;
    if (!question || !answer || !level) {
      return res.status(400).json({ message: 'Missing required fields: question, answer, level' });
    }
    const db = getDb();
    const result = await db.collection('riddles').insertOne({ question, answer, level });
    res.status(201).json({ message: 'Riddle added successfully', insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add riddle', error: error.message });
  }
});

// PUT /api/riddles/riddle/:id - עדכן חידה לפי ID
router.put('/riddle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, level } = req.body;
    const db = getDb();
    const result = await db.collection('riddles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { question, answer, level } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Riddle not found' });
    }
    res.status(200).json({ message: 'Riddle updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update riddle', error: error.message });
  }
});

// DELETE /api/riddles/riddle/:id - מחק חידה לפי ID
router.delete('/riddle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const result = await db.collection('riddles').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Riddle not found' });
    }
    res.status(200).json({ message: 'Riddle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete riddle', error: error.message });
  }
});

router.post('/load-initial-riddles', async (req, res) => {
  try {
    const initialRiddles = req.body; 
    if (!Array.isArray(initialRiddles) || initialRiddles.length === 0) {
        return res.status(400).json({ message: 'Request body must be a non-empty array of riddles.' });
    }
    const db = getDb();
    await db.collection('riddles').deleteMany({}); 
    const result = await db.collection('riddles').insertMany(initialRiddles);
    res.status(201).json({ message: `Successfully loaded ${result.insertedCount} riddles.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load initial riddles', error: error.message });
  }
});


export default router;