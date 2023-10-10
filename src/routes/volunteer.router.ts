import {
  getVolunteers,
  createVolunteer,
  changeVolunteerApproval,
  matchVolunteerAndStudent,
  unmatchVolunteerAndStudent,
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
volunteerRouter.patch('/match', matchVolunteerAndStudent);
volunteerRouter.patch('/unmatch', unmatchVolunteerAndStudent);

export = volunteerRouter;
