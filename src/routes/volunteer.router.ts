import {
  getVolunteer,
  createVolunteer,
  changeVolunteerApproval,
  matchVolunteerAndStudent,
  unmatchVolunteerAndStudent,
} from '../controllers/volunteer.controller';
import express from 'express';

const volunteerRouter = express.Router();

/* Admin Controller */
volunteerRouter.post('/', createVolunteer);
volunteerRouter.get('/:volunteerId', getVolunteer);
volunteerRouter.get('/allVolunteers', getVolunteer);
volunteerRouter.patch(
  '/:volunteerId/changeVolunteerApprovalStatus',
  changeVolunteerApproval
);
volunteerRouter.patch('/match', matchVolunteerAndStudent);
volunteerRouter.patch('/unmatch', unmatchVolunteerAndStudent);

export = volunteerRouter;
