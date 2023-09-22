import { createVolunteer } from '../controllers/volunteer.controller';
import { getVolunteers } from '../controllers/volunteer.controller';
import express from 'express';

const volunteerRouter = express.Router();

/* Admin Controller */
volunteerRouter.post('/', createVolunteer);
volunteerRouter.get('/allVolunteers', getVolunteers);

export = volunteerRouter;
