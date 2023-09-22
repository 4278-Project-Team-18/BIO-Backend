# BIO Project Backend

## Description
Node.js and express backend for the BIO project.

## Installation
1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm start` to start the server

## Todo list of endpoints

#### Admin tasks
[ADMIN-0] Create admin account - POST /admin/ (will be replaced by register in future)


[ADMIN-1] Admin view all classes - GET /classes 
[ADMIN-2] Admin view individual class - GET /classes/:classId
[ADMIN-3] Admin edit class - PUT /classes/:classId
[ADMIN-4] Admin add class - POST /classes
[ADMIN-5] Admin invite teacher to a class (email code) - POST /classes/:classId/invite
[ADMIN-6] Admin view volunteers - GET /volunteers
[ADMIN-7] Admin edit volunteer - PUT /volunteers/:volunteerId
[ADMIN-8] Admin invite volunteer (email code) - POST /volunteers/invite
[ADMIN-9] Admin approve volunteer - PUT /volunteers/:volunteerId/approve
[ADMIN-10] Admin match volunteer with a student - PUT /volunteers/:volunteerId/match
[ADMIN-11] Admin upload file for a student - POST /students/:studentId/upload
[ADMIN-12] Admin edit expected delivery date - PUT /students/:studentId/expectedDelivery
[ADMIN-13] Admin make tables read only for teacher and/or volunteer - PUT /classes/:classId/readonly
[ADMIN-14] Admin view compiled list of books to purchase - GET /classes/:classId/books
[ADMIN-15] Admin clear student data - DELETE /students/:studentId
[ADMIN-16] Admin login and sign up - POST /admin/login and POST /admin/signup
[ADMIN-17] Admin invite another admin (email code) - POST /admin/invite


