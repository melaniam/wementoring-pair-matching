import fs from 'fs';
import csv from 'csv-parser';
import stripBom from 'strip-bom-stream';
import { stringify } from 'csv-stringify';

import { mapMenteesToMentors } from './mapping.mjs';

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
    const mappings = mapMenteesToMentors(mentors, mentees);

    const writableStream = fs.createWriteStream(pathToMappingsFile);
    const columns = [
        // mentor fields
        // 'email',
        // 'name',
        // 'role',
        // 'workplace',
        // 'linkedin',
        // 'typeOfIC',
        // 'typeOfManager',
        // 'workingArea',
        // 'topicsToMentorOn',
        // 'numberOfMentees',
        // mentees or mapping fields here?

        'mentor',
        'mentorRole',
        'mentorAreaOfExpertise',
        'mentorTopicsLong',
        'commonTopics',
        'mentee',
        'menteeRole',
        'menteeTopicsLong',
        'menteeLearningGoal',
        'contact',
    ];

    const stringifier = stringify({ header: true, columns: columns });

    mappings.forEach((mapping) => {
        stringifier.write(mapping);
    });

    stringifier.pipe(writableStream);
    console.log('Finished writing data.');
});
