const LOG_LEVEL = 'debug'; // debug or info

const TYPES_OF_IC = {
    noExperience: {
        label: 'No Experience',
        index: 1,
    },
    student: {
        label: 'Student',
        index: 2,
    },
    junior: {
        label: 'Junior',
        index: 3,
    },
    midLevel: {
        label: 'Mid level',
        index: 4,
    },
    senior: {
        label: 'Senior',
        index: 5,
    },
    expert: {
        label: 'Expert',
        index: 6,
    },
    other: {
        label: 'Other',
        index: 0,
    },
};

const TYPES_OF_MANAGERS = {
    firstLevelManager: {
        label: 'First level Manager (managing individual contributors, for example Manager)',
        index: 6,
    },
    secondLevelManager: {
        label: 'Second level Manager (managing managers, for example roles such as Head of, Director)',
        index: 7,
    },
    thirdLevelManager: {
        label: 'Third level Manager (managing managers of managers, for example Director, VP,  CxO)',
        index: 8,
    },
    other: {
        label: 'Other',
        index: 0,
    },
};

const GENDER_PRIORITY = {
    Men: 0,
    'Non Binary / Other': 1,
    Woman: 4,
};

const LOCATION_PRIORITY = {
    Other: 0,
    'Romania (excluding Cluj) or Moldova': 1,
    Cluj: 2,
};

const PRIORITIES_INDEX = [6, 5, 4, 3, 2, 1, 0];

const logMentors = (mentors, msg) => {
    if (LOG_LEVEL === 'debug') {
        if (msg) console.log(msg);
        console.table(
            mentors.map((mentor) => ({
                mentor: mentor.name,
                workingArea: mentor.workingArea,
                workplace: mentor.workplace.substring(0, 20),
                // typeOfIC: mentor.typeOfIC,
                // typeOfManager: mentor.typeOfManager,
                seniorityLevel: getTypeOfManager(mentor)?.index || getTypeOfIndividualContributor(mentor)?.index || 0,
                assigned: mentor.assigned,
            }))
        );
    }
};
const logMentees = (mentees, msg) => {
    if (LOG_LEVEL === 'debug') {
        if (msg) console.log(msg);
        console.table(
            mentees.map((mentee) => ({
                mentee: mentee.name,
                worksInIT: mentee.workInIT,
                changeDomain: mentee.changeDomain,
                changeDomainTo: mentee.changeDomainTo,
                workingArea: mentee.workingArea,
                workplace: mentee.workplace.substring(0, 20),
                seniorityLevel: getTypeOfManager(mentee)?.index || getTypeOfIndividualContributor(mentee)?.index || 0,
                assigned: mentee.assigned,
            }))
        );
    }
};
const logPairs = (pairs, msg) => {
    if (LOG_LEVEL === 'debug') {
        if (msg) console.log(msg);
        console.table(pairs.map(({ mentor, mentee }) => ({ mentor: mentor?.name, mentee: mentee?.name })));
    }
};

const getTypeOfIndividualContributor = (person) => {
    return Object.values(TYPES_OF_IC).find((type) => type.label === person.typeOfIC?.trim());
};

const getTypeOfManager = (person) => {
    return Object.values(TYPES_OF_MANAGERS).find((type) => type.label === person.typeOfManager?.trim());
};

const getTopicsOnWhichMenteeCanBeMentoredByMentor = (mentor, mentee) => {
    const mentorTopics = mentor.topicsToMentorOn.split(',').map((topic) => topic.trim().toLowerCase());
    const menteeTopics = mentee.topicsToBeMentoredOn.split(',').map((topic) => topic.trim().toLowerCase());

    const matchingMentorTopics = mentorTopics.filter((mentorTopic) =>
        menteeTopics.some((menteeTopic) => menteeTopic === mentorTopic)
    );

    return matchingMentorTopics;
};

const isValidPair = (mentor, mentee) => {
    // is not the same person
    if (mentor.email === mentee.email) {
        return false;
    }

    // do not match people that are already assigned
    if (mentor.assigned || mentee.assigned) {
        return false;
    }

    // do not match members of the same company
    if (mentor.workplace === mentee.workplace) {
        return false;
    }

    return true;
};

const changeDomainOfActivity = (mentors, mentees, results) => {
    mentees.forEach((mentee) => {
        if (mentee.workInIT == 'No' || (mentee.workInIT == 'Yes' && mentee.changeDomain == 'Yes')) {
            logMentees([mentee], 'Mentee to change domain of activity');
            logMentors(mentors, 'All mentors');

            const validMentors = mentors.filter(
                (mentor) =>
                    !mentor.assigned &&
                    mentor.workplace != mentee.workplace &&
                    mentor.workingArea === mentee.changeDomainTo
            );
            logMentors(validMentors, 'Valid mentors');

            const sortedValidMentors = validMentors.sort((a, b) => {
                const aSeniority = getTypeOfManager(a)?.index || getTypeOfIndividualContributor(a)?.index || 0;
                const bSeniority = getTypeOfManager(b)?.index || getTypeOfIndividualContributor(b)?.index || 0;

                return aSeniority - bSeniority;
            });
            logMentors(sortedValidMentors, 'Sorted valid mentors');

            const mentor = sortedValidMentors[0];

            if (mentor) {
                mentor.assigned = true;
                mentee.assigned = true;

                results.push({
                    mentee,
                    mentor,
                });
                logPairs([{ mentor, mentee }], 'Pair matched');
            }
        }
    });
    logPairs(results, 'Pairs matched at this step');
};

const isMatchBasedOnWorkingArea = (mentor, mentee, conditionsAreStrict) => {
    if (!isValidPair(mentor, mentee)) {
        return false;
    }

    // Mentors and Mentees should have the same area of expertise
    if (mentor.workingArea !== mentee.workingArea) {
        return false;
    }

    // do not match people that have a specific skill to improve
    if (mentee.learningGoal == 'I have a specific skill I want to improve') {
        return false;
    }

    // Mentors and Mentees should be on the same track ( IC or Manager)
    const mentorTypeOfIC = getTypeOfIndividualContributor(mentor);
    const mentorTypeOfManager = getTypeOfManager(mentor);

    const menteeTypeOfIC = getTypeOfIndividualContributor(mentee);
    const menteeTypeOfManager = getTypeOfManager(mentee);

    const mentorSeniority = mentorTypeOfManager || mentorTypeOfIC || {};
    const menteeSeniority = menteeTypeOfManager || menteeTypeOfIC || {};

    // if they didn't choose "Other", look at the seniority level
    // else try to map everyone to everyone - we need to figure out manually what level of seniority to consider
    if (mentorSeniority.index && menteeSeniority.index) {
        const levelDiff = mentorSeniority.index - menteeSeniority.index;
        if (conditionsAreStrict) {
            // When conditions are strict,
            // Mentor should have a higher level of seniority than the mentee with a degree of 1, except for Other
            if (levelDiff !== 1) {
                return false;
            }
        } else {
            // when conditions are more relaxed, the level of seniority can differ a bit more
            if (levelDiff < 0 || levelDiff > 3) {
                return false;
            }
        }
    }

    return true;
};

const growInSameArea = (mentors, mentees, results) => {
    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            if (isMatchBasedOnWorkingArea(mentor, mentee, true)) {
                mentor.assigned = true;
                mentee.assigned = true;

                results.push({
                    mentor,
                    mentee,
                });

                logPairs([{ mentor, mentee }], 'Pair matched using strict conditions');
            }
        });
    });

    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            if (isMatchBasedOnWorkingArea(mentor, mentee, false)) {
                mentor.assigned = true;
                mentee.assigned = true;

                results.push({
                    mentor,
                    mentee,
                });
                logPairs([{ mentor, mentee }], 'Pair matched using relaxed conditions');
            }
        });
    });
};

const learnNewSkills = (mentors, mentees, results) => {
    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            if (!isValidPair(mentor, mentee)) {
                return false;
            }

            const topics = getTopicsOnWhichMenteeCanBeMentoredByMentor(mentor, mentee, true);

            if (topics.length > 0) {
                mentor.assigned = true;
                mentee.assigned = true;

                results.push({
                    mentor,
                    mentee,
                });

                logPairs([{ mentor, mentee }], 'Pair matched with common topics.');
                if (LOG_LEVEL == 'debug') console.log('Topics:', topics);
            }
        });
    });
};

const runMatchingAlgo = (mentors, mentees, results) => {
    console.info('\nFirst Pass, people that want to change the domain of activity.');
    changeDomainOfActivity(mentors, mentees, results);

    console.info('\nSecond Pass, people that want to grow in the same area.');
    growInSameArea(mentors, mentees, results);

    console.info('\nThird Pass, people that want to learn a new skill.');
    learnNewSkills(mentors, mentees, results);
};

const assignPriority = (mentees) => {
    mentees.forEach((mentee) => {
        mentee.priority = GENDER_PRIORITY[mentee.gender] + LOCATION_PRIORITY[mentee.location];
        if (LOG_LEVEL == 'debug') console.log(mentee.name, 'gets priority', mentee.priority);
    });
};

export const mapMenteesToMentors = (mentors, mentees) => {
    const results = [];
    assignPriority(mentees);

    PRIORITIES_INDEX.forEach((priorityLevel) => {
        console.info('\nRun matching algorithm for mentees with priority level', priorityLevel);
        runMatchingAlgo(
            mentors,
            mentees.filter((mentee) => mentee.priority === priorityLevel),
            results
        );
    });

    console.info("\nMentors who weren't assigned to anyone");
    mentors.forEach((mentor) => {
        if (!mentor.assigned) {
            results.push({
                mentor,
            });
            console.info(' - ', mentor.email);
        }
    });

    console.info("\nMentees who weren't assigned to anyone");
    mentees.forEach((mentee) => {
        if (!mentee.assigned) {
            results.push({
                mentee,
            });
            console.info(' - ', mentee.email);
        }
    });

    logPairs(results, '\n\nFinal pairs');

    return results;
};
