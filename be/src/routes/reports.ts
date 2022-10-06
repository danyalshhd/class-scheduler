import express from 'express';;
import 'dotenv/config';
import { Registeration } from '../models/registerations';
const router = express.Router();

router.get("/v1/registerations/stats", async (req, res) => {
    const result = await Registeration.aggregate(
        [
            {
                $group: {
                    _id: {
                        $dayOfYear: "$dateTimeStartOfClass"
                    },
                    count: {
                        "$sum": 1.0
                    },
                    first: {
                        "$min": "$dateTimeStartOfClass"
                    }
                }
            },
            {
                $project: {
                    date: "$first",
                    count: 1.0,
                    _id: 0.0
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ],
        {
            "allowDiskUse": false
        },
    );
    res.json(result.map(res => {
        res.date = new Date(res.date);
        return {
            name: res.date.getDate() + '/' + res.date.getMonth() + '/' + res.date.getFullYear(),
            value: res.count
        }
    }));
})

export { router as reportsRouter };
