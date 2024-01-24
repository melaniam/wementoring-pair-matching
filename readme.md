This project is used for the process of pair matching at WeMentoring #3.

# Data

This script assumes we already have the `mentees.csv` and `mentors.csv` files in the correct format. Check out the list of transformation below.

## Data Transformations

### Filters

1. Filter out all responses that did not agree with the GDPR terms
2. others...

### Header mapping

Rename columons based on the mapping below. Remove unused columns.

#### Mentees

<!-- prettier-ignore -->
|Original|Transformed|
|---|---|
|Timestamp|**Not Used**|
|Email Address|email|
|What is your name?|name|
|Why did you apply for this program?|**Not Used**|
|How do you identify yourself?|gender|
|Where do you live?|location|
|Do you work in IT?|workInIT|
|Do you want to change your work domain? For example you work in engineering and you want to switch to project management|changeDomain|
|In which area would you like to work?|changeDomainTo|
|What experience do you have in this area?|changeDomainExperience|
|What is your work domain?|workingArea|
|Do you manage people directly?|**Not Used**|
|What type of manager are you?|typeOfManager|
|What level of seniority do you have in your current work area?|typeOfIC|
|What is your goal for mentorship? What do you want to achieve from this mentorship program?|learningGoal|
|What skill do you want to improve?|topicsToBeMentoredOn|
|Is there anything else that is important for us to know?|**Not Used**|
|I agree with the processing of personal data. According to the requirements of the GDPR Law 677/2001 regarding the processing of personal data and the free circulation of this data, Women in Tech Cluj manages the personal data that you provide in safe conditions and only for the specified purposes.|**Not Used**|
|Can you think of anything that might block you from engaging in the WeMentoring program?|blockers|
|The WeMentoring program is a 4 months program. Can you allocate at least one hour every 2 weeks for the mentorship?|allocateTime|
|What is your Linkedin profile?|linkedin|
|What company are you working at right now?|workplace|

#### Mentors

<!-- prettier-ignore -->
|Original|Transformed|
| ---- | ---- |
| Timestamp | **Not Used** |
| Email Address | email |
| What is your name? | name |
| Why did you apply for this program? | **Not Used** |
| What is your Linkedin profile? | linkedin |
| What company are you working at right now? | workplace |
| Do you work in IT? | workInIT |
| In which area are you working? Chose the main one. | workingArea |
| Do you have experience mentoring in a structured program? | experienceMentoring |
| Do you manage people directly? | managePeople |
| What type of manager are you? | typeOfManager |
| What experience do you have? | typeOfIC |
| Is there a special skill you can mentor on? What is your super power? | topicsToMentorOn |
| The WeMentoring program is a 4 months program. Can you allocate at least one hour every 2 weeks for the mentorship? | allocateTime |
| Is there anything that might block you from engaging in the WeMentoring program? | blockers |
| How many mentees you would like to be paired with? | numberOfMentees |
| Is there anything else that is important for us to know? | moreComments |
| I agree with the processing of personal data. According to the requirements of the GDPR Law 677/2001 regarding the processing of personal data and the free circulation of this data, Women in Tech Cluj manages the personal data that you provide in safe conditions and only for the specified purposes. | **Not Used** |

# Local Setup

1. Create folders `input` and `output`

    ```sh
    cd /path/to/wementoring-pair-matching
    mkdir input
    mkdir output
    ```

2. Copy the `mentees.csv` and `mentors.csv` files inside the `input` folder
3. Run script `node src/index.mjs`
4. Check the output folder.
