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

const logPairs = (pairs) => {
    console.table(pairs.map(({ mentor, mentee }) => ({ mentor: mentor?.name, mentee: mentee?.name })));
};

const isValidPair = (mentor, mentee, conditionsAreStrict) => {
    // do not match members of the same company
    if (mentor.workplace === mentee.workplace) {
        return false;
    }

    // Mentors and Mentees should have the same area of expertise
    if (mentor.workingArea !== mentee.workingArea) {
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

export const mapMenteesToMentors = (mentors, mentees) => {
    const results = [];

    // First pass
    console.info('First Pass');
    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            if (isValidPair(mentor, mentee, true)) {
                results.push({
                    mentor,
                    mentee,
                });

                mentor.assigned = true;
                mentee.assigned = true;
            }
        });
    });
    logPairs(results);

    // Second pass, relax conditions
    console.info('Second Pass');
    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            const validPair = isValidPair(mentor, mentee, false);

            if (validPair && !mentor.assigned && !mentee.assigned) {
                mentor.assigned = true;
                mentee.assigned = true;

                results.push({
                    mentor,
                    mentee,
                });
            }
        });
    });

    logPairs(results);

    // Third Pass, match on topics
    console.info('Third Pass');
    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            if (mentor.workplace === mentee.workplace) {
                return false;
            }

            const topics = getTopicsOnWhichMenteeCanBeMentoredByMentor(mentor, mentee, true);

            if (topics.length > 0 && !mentor.assigned && !mentee.assigned) {
                mentor.assigned = true;
                mentee.assigned = true;

                results.push({
                    mentor,
                    mentee,
                });
            }
        });
    });

    logPairs(results);

    // find mentors who were not assigned to anyone
    console.info("Mentors who weren't assigned to anyone");
    mentors.forEach((mentor) => {
        if (!mentor.assigned) {
            results.push({
                mentor,
            });
        }
    });

    logPairs(results);

    // find mentees who were not assigned to anyone
    console.info("Mentees who weren't assigned to anyone");
    mentees.forEach((mentee) => {
        if (!mentee.assigned) {
            results.push({
                mentee,
            });
        }
    });

    logPairs(results);

    return results;
};

const changeDomainOfActivity = (mentors, mentees, results) => {
    mentees.forEach((mentee) => {
        // console.log('mentee', mentee);
        if (mentee.workInIT == 'No' || (mentee.workInIT == 'Yes' && mentee.changeDomain == 'Yes')) {
            // console.table(
            //     mentors.map((mentor) => ({
            //         mentor: mentor.name,
            //         workingArea: mentor.workingArea,
            //         workplace: mentor.workplace,
            //         assigned: mentor.assigned,
            //     }))
            // );
            const validMentors = mentors.filter(
                (mentor) =>
                    !mentor.assigned &&
                    mentor.workplace != mentee.workplace &&
                    mentor.workingArea === mentee.changeDomainTo
            );
            // console.table(
            //     validMentors.map((mentor) => ({
            //         mentor: mentor.name,
            //         workingArea: mentor.workingArea,
            //         workplace: mentor.workplace,
            //     }))
            // );
            const sortedValidMentors = validMentors.sort((a, b) => {
                const aSeniority = getTypeOfManager(a)?.index || getTypeOfIndividualContributor(a)?.index || 0;
                const bSeniority = getTypeOfManager(b)?.index || getTypeOfIndividualContributor(b)?.index || 0;

                return aSeniority - bSeniority;
            });
            // console.table(
            //     sortedValidMentors.map((mentor) => ({
            //         mentor: mentor.name,
            //         workingArea: mentor.workingArea,
            //         workplace: mentor.workplace,
            //         typeOfIC: mentor.typeOfIC,
            //         typeOfManager: mentor.typeOfManager,
            //     }))
            // );

            const mentor = sortedValidMentors[0];
            mentor.assigned = true;
            mentee.assigned = true;

            results.push({
                mentee,
                mentor,
            });
        }
        logPairs(results);
    });
};

const gowInSameArea = (mentors, mentees, results) => {
    console.info('Grow in the same area, strict conditions');
    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            const validPair = isValidPair(mentor, mentee, true);

            if (validPair && !mentor.assigned && !mentee.assigned) {
                results.push({
                    mentor,
                    mentee,
                });

                mentor.assigned = true;
                mentee.assigned = true;
            }
        });
    });
    logPairs(results);

    console.info('Grow in the same area, relaxed conditions');
    mentors.forEach((mentor) => {
        mentees.forEach((mentee) => {
            const validPair = isValidPair(mentor, mentee, false);

            if (validPair && !mentor.assigned && !mentee.assigned) {
                mentor.assigned = true;
                mentee.assigned = true;

                results.push({
                    mentor,
                    mentee,
                });
            }
        });
    });
    logPairs(results);
};

export const newAlgoForMatching = (mentors, mentees) => {
    const results = [];

    console.info('First Pass, people that want to change domain.');
    changeDomainOfActivity(mentors, mentees, results);

    console.info('Second Pass, people that do not have a clear goal yet.');
    gowInSameArea(mentors, mentees, results);

    return results;
};
