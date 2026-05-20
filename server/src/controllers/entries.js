import * as entryService from '../services/entries.js';

export const postEntry = async (req, res, next) => {
    
    try {
        // userId = req.user.userId;
        const userEntry = await entryService.postEntry("userId", req.body.rawText);
        res.status(201).json(userEntry);
    } catch (error) {
        next(error);
    };
}

export const getEntries = async (req, res, next) => {
    try {
        const existingEntries = await entryService.getEntries("req.user.userId", Date.now());
        res.status(200).json(existingEntries);
    } catch (error) {
        next(error);
    }
}