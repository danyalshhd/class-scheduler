import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { RegisterationsService } from '../services/registerations';
import { students } from '../models/students';
import { instructors } from '../models/instructors';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, './src/routes/uploads/')
  },
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname),
    )
  },
})
const upload = multer({
  storage: storage,
})

router.get("/v1/test", (req, res) => {
  res.json("test");
})

router.post("/v1/registerations", upload.single('uploadcsv'),
  async (req: Request, res: Response) => {
    try {
      const insertCollection = [];
      const deleteCollection = [];
      const registrationStatus = [];
      let status;
      let studentId;
      let instructorId;
      
      const registerationService = new RegisterationsService();
      const parsedcsv = await registerationService.parseCsv(__dirname + '/uploads/' + req.file.filename);
      console.log(parsedcsv);
      const getExistingSchedules = await registerationService.getExistingSchedules(parsedcsv);

      parsedcsv.forEach((upComReg, pdIndex) => {
        
        status = '';
        studentId = +upComReg.studentID;
        instructorId = +upComReg.instructorID;
        upComReg.duration = +process.env.CLASS_DURATION;

        let getOverlappingWithinFile = parsedcsv.find((overReg, overIndex) => 
          overIndex !== pdIndex 
          && registerationService.checkClassOverlap(
            upComReg.dateTimeStartOfClass,
            overReg.dateTimeStartOfClass,
          ) 
          && (
            +overReg.studentID === studentId
            || +overReg.instructorID === instructorId
          )
        )
        if (getOverlappingWithinFile) {
          status = "class already scheduled at this time with either same instructor or student";
        }

        const getStudent = students.find(st => st.studentExternalId === studentId);
        if (getStudent && getStudent.classCount > +process.env.STUDENT_CLASS_COUNT_CONFIG) {
          status = "student class count exceeded";
        }

        const getInstructor = instructors.find(st => st.instructorExternalId === instructorId);
        if (getInstructor && getInstructor.classCount > +process.env.INSTRUCTOR_CLASS_COUNT_CONFIG) {
          status = "instructor class count exceeded";
        }

        let getSameScheduledClass = getExistingSchedules.find(
          exSch => registerationService.checkClassOverlap(
            upComReg.dateTimeStartOfClass,
            exSch.dateTimeStartOfClass,
            exSch.duration,
          ) && (
              exSch.studentID === studentId
              || exSch.instructorID === instructorId
            )
        )
        if (getSameScheduledClass) {
          status = "class already scheduled at this time with either same instructor or student"
        }
        // console.log(upComReg);
        // console.log(status);
        // console.log("========")
        if (!status) {
          //TODO: Make definitions for actions[new, update, delete]
          if (upComReg.action === 'new') {
            status = "Inserted Successfully";
            if (!upComReg.registrationID) {
              upComReg.registrationID = uuidv4();
            }
            insertCollection.push(upComReg)
            getStudent && ++getStudent.classCount;
          }
          else if (upComReg.action === 'update') {
            status = "Updated Successfully";
            insertCollection.push(upComReg);
            deleteCollection.push(upComReg.registrationID);
          }
          else if (upComReg.action === 'delete') {
            status = "Deleted Successfully";
            deleteCollection.push(upComReg.registrationID);
            let getExistingRegisteration = getExistingSchedules.find(ges => ges.registrationID === upComReg.registrationID);
            if (getExistingRegisteration) {
              let getExistingStudent = students.find(s => s.studentExternalId === getExistingRegisteration.studentID);
              let getExistingInstructor = instructors.find(s => s.instructorExternalId === getExistingRegisteration.instructorID);
              --getExistingInstructor.classCount;
              --getExistingStudent.classCount;
            }
          }
        }

        registrationStatus.push({
          id: upComReg.registrationID,
          status,
        })
      })
      console.log(deleteCollection)
      console.log("==============")
      console.log(insertCollection)

      deleteCollection.length && await registerationService.deleteRecords(deleteCollection);
      insertCollection.length && await registerationService.insertRecords(insertCollection);

      res.json({
        msg: 'File successfully inserted!',
        registrationStatus,
      })
    } catch (error) {
      res.json({
        msg: error.message
      })
    }

  });

export { router as registerationsRouter };
