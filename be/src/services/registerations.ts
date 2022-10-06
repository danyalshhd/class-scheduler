const csv = require('csvtojson')
import 'dotenv/config';
import { Registeration } from '../models/registerations';
import { BadRequestError } from '@dstransaction/common';

export class RegisterationsService {
    constructor() {   
    }

    async parseCsv(csvUrl: string) {
        const array = await csv().fromFile(csvUrl);
        return array;
    }

    async getExistingSchedules(schedules) {

        const sortedArray = schedules
            .filter(schedule => schedule.action === 'new' || schedule.action === 'update')
            .sort((a, b) => {
                return +new Date(b.dateTimeStartOfClass) - +new Date(a.dateTimeStartOfClass);
            });
        
        const endTimeWithBuffer = new Date(sortedArray[0].dateTimeStartOfClass);
        endTimeWithBuffer.setHours(endTimeWithBuffer.getHours() + 2);
        const startTimeWithBuffer = new Date(sortedArray[sortedArray.length - 1].dateTimeStartOfClass)
        startTimeWithBuffer.setHours(startTimeWithBuffer.getHours() - 2);
        
        const classSchedules = await Registeration.find({
            dateTimeStartOfClass: {
                $gte: startTimeWithBuffer,
                $lte: endTimeWithBuffer,
            }
        });

        return classSchedules;
    }

    checkClassOverlap(expectedScheduleTime, existingScheduleTime, oldDuration = null) {
        try {
            existingScheduleTime = new Date(existingScheduleTime);
            let upComingStartClassTime = new Date(expectedScheduleTime);
            let upComingEndClassTime = new Date(expectedScheduleTime);
            upComingEndClassTime.setMinutes(+process.env.CLASS_DURATION + upComingEndClassTime.getMinutes());

            let existingScheduleEndTime = new Date(existingScheduleTime);
            existingScheduleEndTime.setMinutes((oldDuration || +process.env.CLASS_DURATION) + existingScheduleEndTime.getMinutes())

            const isOverlapped = upComingStartClassTime <= existingScheduleEndTime
                && upComingStartClassTime >= existingScheduleTime;
            return isOverlapped;
        }
        catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async insertRecords(records) {
        await Registeration.insertMany(records)
            .then(() => {
                console.log('data inserted');
            })
            .catch(error => {
                throw new BadRequestError(error.message);
            })
    }

    async deleteRecords(records) {
        records = records.map(x => x);
        await Registeration.deleteMany({ registrationID: {
            $in: records
        }})
        .then(() => {
            console.log('records deleted');
        })
        .catch(error => {
            throw new BadRequestError(error.message);
        })
    }
}