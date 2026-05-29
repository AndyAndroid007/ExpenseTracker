import * as entryService from '../services/entries.js';
import logger from '../utils/logger.js';

export const postEntry = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const timezoneOffsetMinutes = req.headers['x-timezone-offset-minutes'] || 0;
        
        logger.info({ userId, timezoneOffsetMinutes }, 'Incoming request to create a new expense entry');
        
        const userEntry = await entryService.postEntry(userId, req.body.rawText, timezoneOffsetMinutes);

        logger.info({ userId, entryId: userEntry.entry.id }, 'Successfully created and confirmed entry');
        res.status(201).json(userEntry);
    } catch (error) {
        logger.error({ err: error, userId }, 'Failed to create expense entry in controller');
        next(error);
    }
}

export const getEntries = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const filters = {
            from: req.query.from,
            to: req.query.to,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset, 10) : undefined,
        }
        
        logger.debug({ userId, filters }, 'Incoming request to fetch entries list');
        
        const existingEntries = await entryService.getEntries(userId, filters);
        
        logger.info({ userId, count: existingEntries.entries.length }, 'Successfully retrieved entries list');
        res.status(200).json(existingEntries);
    } catch (error) {
        logger.error({ err: error, userId }, 'Failed to fetch entries in controller');
        next(error);
    }
}

export const patchEntry = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entryId = req.params.id;
        
        logger.info({ userId, entryId }, 'Incoming request to patch entry fields');
        
        const updatedEntry = await entryService.patchEntry(userId, entryId, req.body);

        logger.info({ userId, entryId }, 'Successfully updated entry');
        res.status(200).json(updatedEntry);
    } catch (error) {
        logger.error({ err: error, userId, entryId }, 'Failed to patch entry in controller');
        next(error);
    }
}

export const deleteEntry = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entryId = req.params.id;
        
        logger.info({ userId, entryId }, 'Incoming request to delete entry');
        
        const deletedEntry = await entryService.deleteEntry(userId, entryId);

        logger.info({ userId, entryId }, 'Successfully soft-deleted entry');
        res.status(200).json(deletedEntry);
    } catch (error) {
        logger.error({ err: error, userId, entryId }, 'Failed to delete entry in controller');
        next(error);
    }
}