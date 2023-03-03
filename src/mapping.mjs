const TYPES_OF_IC = {
    student: {
        label: 'Student',
        index: 1,
    },
    junior: {
        label: 'Junior',
        index: 2,
    },
    midLevel: {
        label: 'Mid level',
        index: 3,
    },
    senior: {
        label: 'Senior',
        index: 4,
    },
    expert: {
        label: 'Expert',
        index: 5,
    },
    other: {
        label: 'Other',
        index: 0,
    },
};

const TYPES_OF_MANAGERS = {
    firstLevelManager: {
        label: 'First level Manager (managing individual contributors, for example Manager)',
        index: 4,
    },
    secondLevelManager: {
        label: 'Second level Manager (managing managers, for example roles such as Head of, Director)',
        index: 5,
    },
    thirdLevelManager: {
        label: 'Third level Manager (managing managers of managers, for example Director, VP,  CxO)',
        index: 6,
    },
    other: {
        label: 'Other',
        index: 0,
    },
};

const getTypeOfIndividualContributor = (person) => {
    return Object.values(TYPES_OF_IC).find((type) => type.label === person.typeOfIC.trim());
};

const getTypeOfManager = (person) => {
    return Object.values(TYPES_OF_MANAGERS).find((type) => type.label === person.typeOfManager.trim());
};

const getTopicsOnWhichMenteeCanBeMentoredByMentor = (mentor, mentee) => {
    const mentorTopics = mentor.topicsToMentorOn.split(',').map((topic) => topic.trim());
    const menteeTopics = mentee.topicsToBeMentoredOn.split(',').map((topic) => topic.trim());

    const matchingMentorTopics = mentorTopics.filter((mentorTopic) =>
        menteeTopics.some((menteeTopic) => menteeTopic === mentorTopic)
    );

    return matchingMentorTopics;
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
            if (levelDiff < 0 || levelDiff > 2) {
                return false;
            }
        }
    }

    return true;
};

export const mapMenteesToMentors = (mentors, mentees) => {
    const results = [];

    // First pass
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

    // Second pass
    console.log('Second Pass');
    mentors.forEach((mentor) => {
        console.log(mentor.name);

        mentees.forEach((mentee) => {
            const validPair = isValidPair(mentor, mentee);

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

    // Third Pass
    console.log('Third Pass');

    mentors.forEach((mentor) => {
        console.log(mentor.name);

        mentees.forEach((mentee) => {
            if (mentor.workplace === mentee.workplace) {
                return;
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

    // find mentors who were not assigned to anyone
    mentors.forEach((mentor) => {
        if (!mentor.assigned) {
            results.push({
                mentor,
            });
        }
    });

    // find mentees who were not assigned to anyone
    mentees.forEach((mentee) => {
        if (!mentee.assigned) {
            results.push({
                mentee,
            });
        }
    });

    return results;
};
