import {
  getVolunteers,
  createVolunteer,
  changeVolunteerApproval,
} from '../controllers/volunteer.controller';
import express from 'express';

const volunteerRouter = express.Router();

/* Admin Controller */
volunteerRouter.post('/', createVolunteer);
volunteerRouter.get('/allVolunteers', getVolunteers);
volunteerRouter.patch(
  '/:volunteerId/changeVolunteerApprovalStatus',
  changeVolunteerApproval
);

export = volunteerRouter;
