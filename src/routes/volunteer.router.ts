import {
  getVolunteers,
  createVolunteer,
  approveVolunteer,
  denyVolunteer,
} from '../controllers/volunteer.controller';
import express from 'express';

const volunteerRouter = express.Router();

/* Admin Controller */
volunteerRouter.post('/', createVolunteer);
volunteerRouter.get('/allVolunteers', getVolunteers);
volunteerRouter.patch('/:volunteerId/approve', approveVolunteer);
volunteerRouter.patch('/:volunteerId/deny', denyVolunteer);

export = volunteerRouter;
