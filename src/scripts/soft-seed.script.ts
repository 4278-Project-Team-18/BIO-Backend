import { connectTestsToMongo } from '../util/tests.util';
import logger from '../config/logger.config';
import Teacher from '../models/teacher.model';
import Class from '../models/class.model';
import Admin from '../models/admin.model';
import Student from '../models/student.model';
import Invite from '../models/invite.model';
import Volunteer from '../models/volunteer.model';

const softSeed = async () => {
  await connectTestsToMongo();
  // delete the classes with no students
  await Class.deleteMany({});
  await Student.deleteMany({});
  logger.info('deleted all classes and all students');

  // delete all the admin except the admin with the email 'admn.cwrubio@gmail.com
  await Admin.deleteMany({ email: { $ne: 'admn.cwrubio@gmail.com' } });
  logger.info('deleted all admins');

  // delete all the admin except the admin with the email 'teacher.cwrubio@gmail.com'
  await Teacher.deleteMany({ email: { $ne: 'teacher.cwrubio@gmail.com' } });
  logger.info('deleted all teachers');

  // delete all the volunteers except the volunteer with the email 'volunteer.cwrubio@gmail.com'
  await Volunteer.deleteMany({ email: { $ne: 'volunteer.cwrubio@gmail.com' } });
  logger.info('deleted all volunteers');

  // delete all of the invites except the ones with the emails 'teacher.cwrubio@gmail.com', 'volunteer.cwrubio@gmail.com', and 'admn.cwrubio@gmail.com'
  await Invite.deleteMany({
    email: {
      $nin: [
        'teacher.cwrubio@gmail.com',
        'volunteer.cwrubio@gmail.com',
        'admn.cwrubio@gmail.com',
      ],
    },
  });
  logger.info('deleted all invites');
};

softSeed();
