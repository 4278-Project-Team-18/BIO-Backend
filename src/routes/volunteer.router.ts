import {
  getVolunteers,
  createVolunteer,
  changeVolunteerApproval,
  matchVolunteerAndStudent,
  unmatchVolunteerAndStudent,
  getVolunteer,
} from '../controllers/volunteer.controller';
import express from 'express';

const volunteerRouter = express.Router();

/* Admin Controller */
volunteerRouter.get('/:volunteerId', getVolunteer);
volunteerRouter.get('/', getVolunteers);
volunteerRouter.post('/', createVolunteer);
volunteerRouter.patch(
  '/:volunteerId/changeVolunteerApprovalStatus',
  changeVolunteerApproval
);
volunteerRouter.patch('/match', matchVolunteerAndStudent);
volunteerRouter.patch('/unmatch', unmatchVolunteerAndStudent);

export = volunteerRouter;
