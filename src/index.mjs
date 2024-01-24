import fs from 'fs';
import csv from 'csv-parser';
import stripBom from 'strip-bom-stream';
import { stringify } from 'csv-stringify';

import { mapMenteesToMentors, newAlgoForMatching } from './mapping.mjs';

const pathToMentorsFile = './input/mentors.csv';
const pathToMenteesFile = './input/mentees.csv';
const pathToMappingsFile = './output/mappings.csv';

const mentorsPromise = new Promise((resolve, reject) => {
    const mentors = [];

    fs.createReadStream(pathToMentorsFile)
        .pipe(stripBom())
        .pipe(csv({ separator: ',' }))
        .on('data', (data) => mentors.push(data))
        .on('end', async () => {
            resolve(mentors);
        });
});

const menteesPromise = new Promise((resolve, reject) => {
    const mentees = [];
    fs.createReadStream(pathToMenteesFile)
        .pipe(stripBom())
        .pipe(csv({ separator: ',' }))
        .on('data', (data) => mentees.push(data))
        .on('end', async () => {
            resolve(mentees);
        });
});

Promise.all([mentorsPromise, menteesPromise]).then(([mentors, mentees]) => {
    const mappings = newAlgoForMatching(mentors, mentees);

    const mappingsToExport = mappings.map(({ mentor, mentee }) => ({
        mentorEmail: mentor ? mentor.email : '-',
        mentorName: mentor ? mentor.name : '-',
        mentorRole: mentor ? mentor.role : '-',
        mentorWorkplace: mentor ? mentor.workplace : '-',
        mentorLinkedin: mentor ? mentor.linkedin : '-',
        mentorTypeOfIC: mentor ? mentor.typeOfIC : '-',
        mentorTypeOfManager: mentor ? mentor.typeOfManager : '-',
        mentorWorkingArea: mentor ? mentor.workingArea : '-',
        mentorTopicsToMentorOn: mentor ? mentor.topicsToMentorOn : '-',
        mentorNumberOfMentees: mentor ? mentor.numberOfMentees : '-',
        mentorMoreComments: mentor ? mentor.moreComments : '-',
        mentorAllocateTime: mentor ? mentor.allocateTime : '-',
        mentorBlockers: mentor ? mentor.blockers : '-',

        menteeEmail: mentee ? mentee.email : '-',
        menteeName: mentee ? mentee.name : '-',
        menteeTypeOfIC: mentee ? mentee.typeOfIC : '-',
        menteeTypeOfManager: mentee ? mentee.typeOfManager : '-',
        menteeWorkingArea: mentee ? mentee.workingArea : '-',
        menteeRole: mentee ? mentee.role : '-',
        menteeWorkplace: mentee ? mentee.workplace : '-',
        menteeLinkedin: mentee ? mentee.linkedin : '-',
        menteeLearningGoal: mentee ? mentee.learningGoal : '-',
        menteeTopicsToBeMentoredOn: mentee ? mentee.topicsToBeMentoredOn : '-',
        menteeBlockers: mentee ? mentee.blockers : '-',
        menteeMoreComments: mentee ? mentee.moreComments : '-',
    }));

    const writableStream = fs.createWriteStream(pathToMappingsFile);
    const columns = [
        'mentorEmail',
        'mentorName',
        'mentorRole',
        'mentorWorkplace',
        'mentorLinkedin',
        'mentorTypeOfIC',
        'mentorTypeOfManager',
        'mentorWorkingArea',
        'mentorTopicsToMentorOn',
        'mentorNumberOfMentees',
        'mentorMoreComments',
        'mentorAllocateTime',
        'mentorBlockers',

        'menteeEmail',
        'menteeName',
        'menteeTypeOfIC',
        'menteeTypeOfManager',
        'menteeWorkingArea',
        'menteeRole',
        'menteeWorkplace',
        'menteeLinkedin',
        'menteeLearningGoal',
        'menteeTopicsToBeMentoredOn',
        'menteeBlockers',
        'menteeMoreComments',
    ];

    const stringifier = stringify({ header: true, columns: columns });

    mappingsToExport.forEach((mapping) => {
        stringifier.write(mapping);
    });

    stringifier.pipe(writableStream);
    console.log('Finished writing data.');
});
