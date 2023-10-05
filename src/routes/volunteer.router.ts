import {
  getVolunteers,
  createVolunteer,
  changeVolunteerApproval,
  matchVolunteerToStudent,
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
volunteerRouter.patch('/matchVolunteerToStudent', matchVolunteerToStudent);

export = volunteerRouter;
