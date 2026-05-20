import { Case, TableSchema } from './types';

export const TABLES: TableSchema[] = [
    {
        tableName: 'crime_scene_report',
        columns: [
            { name: 'date', type: 'INT' },
            { name: 'type', type: 'VARCHAR' },
            { name: 'description', type: 'VARCHAR' },
            { name: 'city', type: 'VARCHAR' }
        ]
    },
    {
        tableName: 'drivers_license',
        columns: [
            { name: 'id', type: 'INT' },
            { name: 'age', type: 'INT' },
            { name: 'height', type: 'INT' },
            { name: 'eye_color', type: 'VARCHAR' },
            { name: 'hair_color', type: 'VARCHAR' },
            { name: 'gender', type: 'VARCHAR' },
            { name: 'plate_number', type: 'VARCHAR' },
            { name: 'car_make', type: 'VARCHAR' },
            { name: 'car_model', type: 'VARCHAR' }
        ]
    },
    {
        tableName: 'person',
        columns: [
            { name: 'id', type: 'INT' },
            { name: 'name', type: 'VARCHAR' },
            { name: 'license_id', type: 'INT' },
            { name: 'address_number', type: 'INT' },
            { name: 'address_street_name', type: 'VARCHAR' },
            { name: 'ssn', type: 'VARCHAR' }
        ]
    },
    {
        tableName: 'facebook_event_checkin',
        columns: [
            { name: 'person_id', type: 'INT' },
            { name: 'event_id', type: 'INT' },
            { name: 'event_name', type: 'VARCHAR' },
            { name: 'date', type: 'INT' }
        ]
    },
    {
        tableName: 'interview',
        columns: [
            { name: 'person_id', type: 'INT' },
            { name: 'transcript', type: 'VARCHAR' }
        ]
    },
    {
        tableName: 'get_fit_now_member',
        columns: [
            { name: 'id', type: 'VARCHAR' },
            { name: 'person_id', type: 'INT' },
            { name: 'name', type: 'VARCHAR' },
            { name: 'membership_start_date', type: 'INT' },
            { name: 'membership_status', type: 'VARCHAR' }
        ]
    },
    {
        tableName: 'get_fit_now_check_in',
        columns: [
            { name: 'membership_id', type: 'VARCHAR' },
            { name: 'check_in_date', type: 'INT' },
            { name: 'check_in_time', type: 'INT' },
            { name: 'check_out_time', type: 'INT' }
        ]
    },
    {
        tableName: 'income',
        columns: [
            { name: 'ssn', type: 'VARCHAR' },
            { name: 'annual_income', type: 'INT' }
        ]
    }
];

export const CASES: Case[] = [
    // --- ACADEMY TRACK (Tutorials) ---
    {
        id: 'academy_01',
        title: 'Module 1: The Select Statement',
        description: 'Introduction to data retrieval.',
        difficulty: 'Easy',
        briefing: `
**Problem**
RECRUIT. Welcome to the SQL City PD. Your first lesson is pulling data from our archives. All citizen records are stored in the \`person\` table. To see every record and every column, we use the asterisk (*) symbol.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

**Goal**
Execute the query and identify the name of the first person in the database.
        `,
        objective: 'What is the name of the first person?',
        expectedAnswer: 'James Smith',
        solutionQuery: `SELECT * FROM person LIMIT 1`,
        hint: 'Use the query: SELECT * FROM person LIMIT 1. Look for the "name" column.'
    },
    {
        id: 'academy_02',
        title: 'Module 2: Specific Columns',
        description: 'Retrieve only the necessary information.',
        difficulty: 'Easy',
        briefing: `
**Problem**
Efficient detectives don't clutter their screens. Sometimes you only need a suspect's SSN. We are still looking at the \`person\` table. Instead of *, specify the columns: \`name\` and \`ssn\`.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

**Goal**
What is the SSN of James Smith?
        `,
        objective: 'Find the SSN of James Smith.',
        expectedAnswer: '000-00-1000',
        solutionQuery: `SELECT name, ssn FROM person WHERE name = 'James Smith'`,
        hint: 'Try "SELECT name, ssn FROM person WHERE name = \'James Smith\'".'
    },
    {
        id: 'academy_03',
        title: 'Module 3: The Filter (WHERE)',
        description: 'Narrowing down suspects.',
        difficulty: 'Easy',
        briefing: `
**Problem**
We have a tip about a suspect named 'Katy Perry'. We need to find her address. The table is \`person\`. The column to check is \`name\`. To filter results, use the WHERE clause. Note: Text values must be inside single quotes (e.g., 'Katy Perry').

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

**Goal**
Find the address_street_name of Katy Perry.
        `,
        objective: 'Find the address_street_name of Katy Perry.',
        expectedAnswer: 'Pop Star Ln',
        solutionQuery: `SELECT * FROM person WHERE name = 'Katy Perry'`,
        hint: 'Use "WHERE name = \'Katy Perry\'". Ensure you capitalize the name exactly as shown.'
    },
    {
        id: 'academy_04',
        title: 'Module 4: Multiple Conditions (AND)',
        description: 'Combining clues.',
        difficulty: 'Easy',
        briefing: `
**Problem**
Sometimes one clue isn't enough. We are looking for a driver.
Clues:
1. Gender is 'female'
2. Eye color is 'blue'
Use the AND operator to combine these conditions in your WHERE clause.

**Schema**
Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| age          | INT     |
| height       | INT     |
| eye_color    | VARCHAR |
| hair_color   | VARCHAR |
| gender       | VARCHAR |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

**Goal**
Find the ID of the first female driver with blue eyes.
        `,
        objective: 'Find the ID of the first female driver with blue eyes.',
        expectedAnswer: '100001',
        solutionQuery: `SELECT * FROM drivers_license WHERE gender = 'female' AND eye_color = 'blue'`,
        hint: 'Your clause should look like: WHERE gender = \'female\' AND eye_color = \'blue\'.'
    },
    {
        id: 'academy_05',
        title: 'Module 5: Sorting (ORDER BY)',
        description: 'Finding the extremes.',
        difficulty: 'Easy',
        briefing: `
**Problem**
We need to find the wealthiest individual in the city for... tax purposes. To sort data, use ORDER BY. To go from High to Low, use DESC (Descending).

**Schema**
Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Goal**
Who has the highest annual income? (Identify by SSN)
        `,
        objective: 'Who has the highest annual income? (Identify by SSN)',
        expectedAnswer: '000-00-0001',
        solutionQuery: `SELECT * FROM income ORDER BY annual_income DESC`,
        hint: 'Use "ORDER BY annual_income DESC" at the end of your query to put the richest person on top.'
    },
    {
        id: 'academy_06',
        title: 'Module 6: Wildcards (LIKE)',
        description: 'Searching with partial information.',
        difficulty: 'Medium',
        briefing: `
**Problem**
A witness saw a car leave a crime scene. They only remember the plate started with "ROA". Use the LIKE operator with the % symbol (wildcard). % matches any sequence of characters.

**Schema**
Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| plate_number | VARCHAR |
| ...          | ...     |
+--------------+---------+

**Goal**
What is the full plate number?
        `,
        objective: 'What is the full plate number?',
        expectedAnswer: 'ROAR',
        solutionQuery: `SELECT * FROM drivers_license WHERE plate_number LIKE 'ROA%'`,
        hint: 'The query "WHERE plate_number LIKE \'ROA%\'" will find any plate starting with ROA.'
    },
    {
        id: 'academy_07',
        title: 'Module 7: Counting (COUNT)',
        description: 'Statistics and Aggregation.',
        difficulty: 'Medium',
        briefing: `
**Problem**
The Chief wants a report on crime statistics. We need to know exactly how many "murder" cases are in the \`crime_scene_report\` table. Use the COUNT() function.

**Schema**
Table: \`crime_scene_report\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| date        | INT     |
| type        | VARCHAR |
| description | VARCHAR |
| city        | VARCHAR |
+-------------+---------+

**Goal**
How many murders have been reported?
        `,
        objective: 'How many murders have been reported?',
        expectedAnswer: '1',
        solutionQuery: `SELECT COUNT(*) FROM crime_scene_report WHERE type = 'murder'`,
        hint: 'Use "SELECT COUNT(*) FROM ..." combined with a WHERE clause filtering for type = \'murder\'.'
    },
    {
        id: 'academy_08',
        title: 'Module 8: Distinct Values',
        description: 'Eliminating duplicates.',
        difficulty: 'Medium',
        briefing: `
**Problem**
We want to know which cities are under our jurisdiction. The \`crime_scene_report\` table lists a city for every crime, but we don't want the same city listed 50 times. We want a unique list. Use the DISTINCT keyword.

**Schema**
Table: \`crime_scene_report\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| date        | INT     |
| type        | VARCHAR |
| description | VARCHAR |
| city        | VARCHAR |
+-------------+---------+

**Goal**
Retrieve the unique list of cities.
        `,
        objective: 'Retrieve the unique list of cities.',
        expectedAnswer: 'SQL City', // Checking for presence of SQL City in results
        solutionQuery: `SELECT DISTINCT city FROM crime_scene_report`,
        hint: 'Put DISTINCT right after SELECT. "SELECT DISTINCT city FROM ..."'
    },
    {
        id: 'academy_09',
        title: 'Module 9: The Join (Intro)',
        description: 'Connecting two tables.',
        difficulty: 'Hard',
        briefing: `
**Problem**
This is the most important skill. Data is split across tables. \`person\` has names, \`drivers_license\` has physical descriptions. They are linked by IDs. \`person.license_id\` matches \`drivers_license.id\`. To see a person's name AND their car model, we JOIN them.

**Schema**
Table: \`person\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| id         | INT     |
| name       | VARCHAR |
| license_id | INT     |
...

Table: \`drivers_license\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | INT     |
| car_model   | VARCHAR |
...

**Goal**
Who drives the "Audi" with model "A4"?
        `,
        objective: 'Who drives the "Audi" with model "A4"?',
        expectedAnswer: 'Katy Perry',
        solutionQuery: `SELECT person.name FROM person JOIN drivers_license ON person.license_id = drivers_license.id WHERE drivers_license.car_make = 'Audi'`,
        hint: 'Join the person and drivers_license tables on the license ID, then filter by car_make = \'Audi\'.'
    },

    // --- INTERVIEW PREP TRACK (Advanced Logic) ---
    {
        id: 'interview_01',
        title: 'Interview: The Salary Gap',
        description: 'Analyze income distribution.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
The Human Resources department requires an analysis of the city's income distribution to assess economic disparity. You are tasked with calculating the mean annual income across all recorded citizens.

**Schema**
Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Example Output**
+----------------+
| average_income |
+----------------+
| 55000          |
+----------------+

**Goal**
Calculate the average annual income of all citizens.
        `,
        objective: 'Calculate the average annual income.',
        expectedAnswer: '85000', // Approximate, logic check
        solutionQuery: `SELECT AVG(annual_income) FROM income`,
        hint: 'Use the AVG() aggregate function on the annual_income column.'
    },
    {
        id: 'interview_02',
        title: 'Interview: High Earners',
        description: 'Filtering aggregated data.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
Financial Crimes Division is investigating potential money laundering activities. We need to identify high-net-worth individuals for audit. Retrieve the Social Security Numbers (SSN) of all citizens with an annual income exceeding $300,000.

**Schema**
Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Example Output**
+-------------+
| ssn         |
+-------------+
| 123-45-6789 |
| 987-65-4321 |
+-------------+

**Goal**
List the SSNs of all high earners (> $300,000).
        `,
        objective: 'List SSNs of high earners.',
        expectedAnswer: '000-00-0001',
        solutionQuery: `SELECT ssn FROM income WHERE annual_income > 300000`,
        hint: 'Use a simple WHERE clause with the greater than operator (>).'
    },
    {
        id: 'interview_03',
        title: 'Interview: The Most Common Car',
        description: 'Grouping and counting.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
The Department of Transportation is analyzing vehicle registration data. Determine the most frequently registered car make in the database. You should count the occurrences of each \`car_make\` and return the one with the highest count.

**Schema**
Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| age          | INT     |
| height       | INT     |
| eye_color    | VARCHAR |
| hair_color   | VARCHAR |
| gender       | VARCHAR |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

**Example Output**
+----------+-------+
| car_make | count |
+----------+-------+
| Toyota   | 145   |
+----------+-------+

**Goal**
Identify the most common car make.
        `,
        objective: 'What is the most common car make?',
        expectedAnswer: 'Ford', // Random seed dependent, but logic is key
        solutionQuery: `SELECT car_make, COUNT(*) as count FROM drivers_license GROUP BY car_make ORDER BY count DESC LIMIT 1`,
        hint: 'Use GROUP BY car_make and ORDER BY COUNT(*) DESC.'
    },
    {
        id: 'interview_04',
        title: 'Interview: Gym Rats',
        description: 'Filtering groups with HAVING.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
"Get Fit Now" management suspects membership abuse. Identify members who have checked in more than once. You need to group check-ins by \`membership_id\` and filter for those with a count greater than 1.

**Schema**
Table: \`get_fit_now_check_in\`
+----------------+---------+
| Column Name    | Type    |
+----------------+---------+
| membership_id  | VARCHAR |
| check_in_date  | INT     |
| check_in_time  | INT     |
| check_out_time | INT     |
+----------------+---------+

**Example Output**
+---------------+
| membership_id |
+---------------+
| 48Z55         |
| 99A11         |
+---------------+

**Goal**
List membership IDs with more than 1 check-in.
        `,
        objective: 'List membership IDs with > 1 check-in.',
        expectedAnswer: '48Z55',
        solutionQuery: `SELECT membership_id FROM get_fit_now_check_in GROUP BY membership_id HAVING COUNT(*) > 1`,
        hint: 'Use GROUP BY membership_id and the HAVING clause to filter the count.'
    },
    {
        id: 'interview_05',
        title: 'Interview: The Second Highest',
        description: 'Subqueries and offsets.',
        difficulty: 'Hard',
        briefing: `
**Problem**
For tax auditing purposes, we need to identify the second wealthiest individual in the city. Find the \`annual_income\` of the person with the second highest income.

**Schema**
Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Example Output**
+---------------+
| annual_income |
+---------------+
| 250000        |
+---------------+

**Goal**
Retrieve the annual_income of the 2nd richest person.
        `,
        objective: 'What is the annual_income of the 2nd richest person?',
        expectedAnswer: '5000000',
        solutionQuery: `SELECT annual_income FROM income ORDER BY annual_income DESC LIMIT 1 OFFSET 1`,
        hint: 'ORDER BY annual_income DESC LIMIT 1 OFFSET 1'
    },
    {
        id: 'interview_06',
        title: 'Interview: No License',
        description: 'Finding missing records (LEFT JOIN).',
        difficulty: 'Hard',
        briefing: `
**Problem**
The Department of Motor Vehicles needs to identify citizens who do not possess a valid driver's license. Perform a Left Join between the \`person\` table and the \`drivers_license\` table to find records where the license information is missing.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| age          | INT     |
| height       | INT     |
| eye_color    | VARCHAR |
| hair_color   | VARCHAR |
| gender       | VARCHAR |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

**Example Output**
+----------+
| name     |
+----------+
| John Doe |
+----------+

**Goal**
List the names of people who have no driver's license.
        `,
        objective: 'List names of people with no license.',
        expectedAnswer: 'John Doe',
        solutionQuery: `SELECT person.name FROM person LEFT JOIN drivers_license ON person.license_id = drivers_license.id WHERE drivers_license.id IS NULL`,
        hint: 'Perform a LEFT JOIN and filter where drivers_license.id IS NULL.'
    },
    {
        id: 'interview_07',
        title: 'Interview: The Rich & Famous',
        description: 'Complex filtering across tables.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Marketing wants to target high-value customers. Identify individuals who meet TWO specific criteria:
1. They hold a 'gold' membership at "Get Fit Now".
2. They have an annual income exceeding $100,000.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`get_fit_now_member\`
+-----------------------+---------+
| Column Name           | Type    |
+-----------------------+---------+
| id                    | VARCHAR |
| person_id             | INT     |
| name                  | VARCHAR |
| membership_start_date | INT     |
| membership_status     | VARCHAR |
+-----------------------+---------+

Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Example Output**
+---------------+
| name          |
+---------------+
| Jeremy Bowers |
+---------------+

**Goal**
List the names of people matching both criteria.
        `,
        objective: 'List names matching both criteria.',
        expectedAnswer: 'Jeremy Bowers',
        solutionQuery: `SELECT person.name FROM person JOIN get_fit_now_member ON person.id = get_fit_now_member.person_id JOIN income ON person.ssn = income.ssn WHERE get_fit_now_member.membership_status = 'gold' AND income.annual_income > 100000`,
        hint: 'Join all three tables: person, get_fit_now_member, and income. Apply the WHERE conditions.'
    },
    {
        id: 'interview_08',
        title: 'Interview: Event Enthusiasts',
        description: 'Correlated Subqueries.',
        difficulty: 'Hard',
        briefing: `
**Problem**
We are analyzing event engagement. Identify the names of people who have attended the 'SQL Symphony Concert' more than once. This requires counting check-ins per person for that specific event and filtering the results.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`facebook_event_checkin\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| person_id  | INT     |
| event_id   | INT     |
| event_name | VARCHAR |
| date       | INT     |
+------------+---------+

**Example Output**
+------------------+
| name             |
+------------------+
| Miranda Priestly |
+------------------+

**Goal**
List the names of frequent concert goers (> 1 attendance).
        `,
        objective: 'List names of frequent concert goers.',
        expectedAnswer: 'Miranda Priestly',
        solutionQuery: `SELECT p.name FROM person p JOIN (SELECT person_id, COUNT(*) as c FROM facebook_event_checkin WHERE event_name = 'SQL Symphony Concert' GROUP BY person_id HAVING c > 1) e ON p.id = e.person_id`,
        hint: 'Create a subquery that counts event checkins by person_id, filter for count > 1, then join with person.'
    },
    {
        id: 'interview_09',
        title: 'Interview: Age Demographics',
        description: 'Case Statements (Bucketing).',
        difficulty: 'Hard',
        briefing: `
**Problem**
The city wants to categorize drivers into age demographics for insurance analysis.
Create three buckets:
- 'Young': Age < 30
- 'Middle': Age 30 - 60 (inclusive)
- 'Senior': Age > 60

Return the count of drivers in each bucket.

**Schema**
Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| age          | INT     |
| height       | INT     |
| eye_color    | VARCHAR |
| hair_color   | VARCHAR |
| gender       | VARCHAR |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

**Example Output**
+-----------+-------+
| age_group | count |
+-----------+-------+
| Young     | 150   |
| Middle    | 300   |
| Senior    | 120   |
+-----------+-------+

**Goal**
Count drivers per age group.
        `,
        objective: 'Count drivers per age group (How many Young drivers?)',
        expectedAnswer: '10',
        solutionQuery: `SELECT COUNT(*) FROM drivers_license WHERE age < 30`,
        hint: 'You can use standard counts: SELECT COUNT(*) FROM drivers_license WHERE age < 30.'
    },
    {
        id: 'interview_10',
        title: 'Interview: Self Join',
        description: 'Finding pairs.',
        difficulty: 'Hard',
        briefing: `
**Problem**
We need to identify potential co-habitants (roommates or family members). Find pairs of different people who share the exact same address (street name and number).
Return the name of the household (e.g., who lives with Morty Schapiro?).

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

**Goal**
What is the name of the person who lives at the same address as Morty Schapiro?
        `,
        objective: 'Who lives with Morty Schapiro?',
        expectedAnswer: 'Summer Smith',
        solutionQuery: `SELECT p2.name FROM person p1 JOIN person p2 ON p1.address_street_name = p2.address_street_name AND p1.address_number = p2.address_number WHERE p1.name = 'Morty Schapiro' AND p2.name != 'Morty Schapiro'`,
        hint: 'Join the person table to itself (p1 JOIN person p2) on address fields and filter by Morty Schapiro.'
    },
    {
        id: 'interview_11',
        title: 'Interview: The Longest Membership',
        description: 'Date calculations.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
"Get Fit Now" wants to reward its most loyal member. Identify the person who has held a membership for the longest duration (i.e., the earliest \`membership_start_date\`).

**Schema**
Table: \`get_fit_now_member\`
+-----------------------+---------+
| Column Name           | Type    |
+-----------------------+---------+
| id                    | VARCHAR |
| person_id             | INT     |
| name                  | VARCHAR |
| membership_start_date | INT     |
| membership_status     | VARCHAR |
+-----------------------+---------+

**Example Output**
+---------------+
| name          |
+---------------+
| Jeremy Bowers |
+---------------+

**Goal**
Identify the name of the longest-standing member.
        `,
        objective: 'Identify the longest-standing member.',
        expectedAnswer: 'Jeremy Bowers', // Depends on seed, but logic holds
        solutionQuery: `SELECT name FROM get_fit_now_member ORDER BY membership_start_date ASC LIMIT 1`,
        hint: 'Order by membership_start_date ASC and take the top 1.'
    },
    {
        id: 'interview_12',
        title: 'Interview: The Unlucky Ones',
        description: 'NOT IN / NOT EXISTS.',
        difficulty: 'Hard',
        briefing: `
**Problem**
We are investigating social isolation. Find the names of people who have a valid driver's license (meaning they have a \`license_id\` in the \`person\` table) but have NEVER attended a Facebook event.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`facebook_event_checkin\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| person_id  | INT     |
| event_id   | INT     |
| event_name | VARCHAR |
| date       | INT     |
+------------+---------+

**Example Output**
+----------+
| name     |
+----------+
| John Doe |
+----------+

**Goal**
List the name of a licensed person with zero event checkins.
        `,
        objective: 'List the name of a licensed person with zero event checkins.',
        expectedAnswer: 'Unlucky Luke',
        solutionQuery: `SELECT name FROM person WHERE id NOT IN (SELECT person_id FROM facebook_event_checkin) AND license_id IS NOT NULL`,
        hint: 'Use WHERE id NOT IN (SELECT person_id FROM ...) AND license_id IS NOT NULL'
    },
    {
        id: 'interview_13',
        title: 'Interview: Peak Hours',
        description: 'Aggregating by time ranges.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Optimize gym staffing by analyzing peak traffic hours. Determine which hour of the day (0-23) has the highest volume of check-ins.
Note: \`check_in_time\` is stored as an integer (e.g., 1730 for 5:30 PM). You need to extract the hour.

**Schema**
Table: \`get_fit_now_check_in\`
+----------------+---------+
| Column Name    | Type    |
+----------------+---------+
| membership_id  | VARCHAR |
| check_in_date  | INT     |
| check_in_time  | INT     |
| check_out_time | INT     |
+----------------+---------+

**Example Output**
+------+-------+
| hour | count |
+------+-------+
| 17   | 450   |
+------+-------+

**Goal**
Identify the hour (0-23) with the most traffic.
        `,
        objective: 'Which hour (0-23) has the most traffic?',
        expectedAnswer: '17', // 5 PM usually
        solutionQuery: `SELECT check_in_time / 100 as hour, COUNT(*) as c FROM get_fit_now_check_in GROUP BY hour ORDER BY c DESC LIMIT 1`,
        hint: 'Divide check_in_time by 100 to get the integer hour. Group by that result.'
    },
    {
        id: 'interview_14',
        title: 'Interview: The Common Name',
        description: 'String manipulation.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
The Census Bureau needs to know the most common first name in the city. You will need to parse the \`name\` column to extract the first name (everything before the first space) and then count occurrences.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

**Example Output**
+------------+-------+
| first_name | count |
+------------+-------+
| James      | 200   |
+------------+-------+

**Goal**
Find the most popular first name.
        `,
        objective: 'Find the most popular first name.',
        expectedAnswer: 'James',
        solutionQuery: `SELECT SPLIT(name, ' ')[0] as first_name, COUNT(*) as c FROM person GROUP BY first_name ORDER BY c DESC LIMIT 1`,
        hint: 'Use SPLIT(name, \' \')[0] to get the first name, then group.'
    },
    {
        id: 'interview_15',
        title: 'Interview: Above Average Height',
        description: 'Subquery in WHERE.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
We are studying physical characteristics of the driving population. Identify all drivers whose height is strictly greater than the average height of all drivers in the database.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| age          | INT     |
| height       | INT     |
| eye_color    | VARCHAR |
| hair_color   | VARCHAR |
| gender       | VARCHAR |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

**Example Output**
+---------------+
| name          |
+---------------+
| Jeremy Bowers |
+---------------+

**Goal**
List the names of drivers taller than average.
        `,
        objective: 'List names of tall drivers.',
        expectedAnswer: 'Jeremy Bowers',
        solutionQuery: `SELECT p.name FROM person p JOIN drivers_license d ON p.license_id = d.id WHERE d.height > (SELECT AVG(height) FROM drivers_license)`,
        hint: 'Calculate AVG(height) in a subquery and compare d.height > (subquery).'
    },
    {
        id: 'interview_16',
        title: 'Interview: The Witness List',
        description: 'UNION operator.',
        difficulty: 'Intermediate',
        briefing: `
**Problem**
The Chief requires a consolidated list of all individuals involved in the investigation. This includes:
1. All witnesses (people who have an entry in the \`interview\` table).
2. All suspects (Gold members of "Get Fit Now").

Combine these two datasets into a single list of names. Ensure there are no duplicates if a person appears in both lists.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`interview\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| person_id  | INT     |
| transcript | VARCHAR |
+------------+---------+

Table: \`get_fit_now_member\`
+-----------------------+---------+
| Column Name           | Type    |
+-----------------------+---------+
| id                    | VARCHAR |
| person_id             | INT     |
| name                  | VARCHAR |
| membership_start_date | INT     |
| membership_status     | VARCHAR |
+-----------------------+---------+

**Example Output**
+----------------+
| name           |
+----------------+
| Morty Schapiro |
| Annabel Miller |
+----------------+

**Goal**
Create a combined, unique list of names from both groups.
        `,
        objective: 'Create a combined list of names.',
        expectedAnswer: 'Morty Schapiro',
        solutionQuery: `SELECT p.name FROM person p JOIN interview i ON p.id = i.person_id UNION SELECT p.name FROM person p JOIN get_fit_now_member g ON p.id = g.person_id WHERE g.membership_status = 'gold'`,
        hint: 'Write two queries and combine them with UNION.'
    },
    {
        id: 'interview_17',
        title: 'Interview: Monthly Crime',
        description: 'Date parsing / formatting.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Analyze the seasonality of crime. Determine which month of the year has the highest number of reported crimes.
The \`date\` is stored as an integer YYYYMMDD. You need to extract the month part (MM) and find the mode.

**Schema**
Table: \`crime_scene_report\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| date        | INT     |
| type        | VARCHAR |
| description | VARCHAR |
| city        | VARCHAR |
+-------------+---------+

**Example Output**
+-------+-------+
| month | count |
+-------+-------+
| 07    | 120   |
+-------+-------+

**Goal**
Identify the month (01-12) with the highest crime rate.
        `,
        objective: 'Identify the month (01-12) with highest crime.',
        expectedAnswer: '01',
        solutionQuery: `SELECT FLOOR((date % 10000) / 100) as month, COUNT(*) as c FROM crime_scene_report GROUP BY month ORDER BY c DESC LIMIT 1`,
        hint: 'Use math: FLOOR((date % 10000) / 100) gives the middle two digits (Month).'
    },
    {
        id: 'interview_18',
        title: 'Interview: The Wealthy Drivers',
        description: 'Three-table Join with Range.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Market research focuses on the "middle-upper" class demographic. Identify the car models driven by individuals with an annual income between $80,000 and $100,000 (inclusive).

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| age          | INT     |
| height       | INT     |
| eye_color    | VARCHAR |
| hair_color   | VARCHAR |
| gender       | VARCHAR |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Example Output**
+-----------+
| car_model |
+-----------+
| Model S   |
| Civic     |
+-----------+

**Goal**
List car models driven by the target income group.
        `,
        objective: 'List car models of middle-upper class.',
        expectedAnswer: 'Model S',
        solutionQuery: `SELECT d.car_model FROM drivers_license d JOIN person p ON d.id = p.license_id JOIN income i ON p.ssn = i.ssn WHERE i.annual_income BETWEEN 80000 AND 100000`,
        hint: 'Join drivers_license -> person -> income. Filter annual_income BETWEEN 80000 AND 100000.'
    },
    {
        id: 'interview_19',
        title: 'Interview: No-Show Members',
        description: 'Finding records with NO match in another table.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Identify "Ghost Members" – individuals who have a gym membership but have never checked in.
Find the names of members whose IDs do not appear in the \`get_fit_now_check_in\` table.

**Schema**
Table: \`get_fit_now_member\`
+-----------------------+---------+
| Column Name           | Type    |
+-----------------------+---------+
| id                    | VARCHAR |
| person_id             | INT     |
| name                  | VARCHAR |
| membership_start_date | INT     |
| membership_status     | VARCHAR |
+-----------------------+---------+

Table: \`get_fit_now_check_in\`
+----------------+---------+
| Column Name    | Type    |
+----------------+---------+
| membership_id  | VARCHAR |
| check_in_date  | INT     |
| check_in_time  | INT     |
| check_out_time | INT     |
+----------------+---------+

**Example Output**
+------------+
| name       |
+------------+
| Lazy Larry |
+------------+

**Goal**
List the names of inactive gym members.
        `,
        objective: 'List lazy gym members.',
        expectedAnswer: 'Lazy Larry',
        solutionQuery: `SELECT name FROM get_fit_now_member WHERE id NOT IN (SELECT membership_id FROM get_fit_now_check_in)`,
        hint: 'Select names from member table where id is NOT IN the check_in table.'
    },
    {
        id: 'interview_20',
        title: 'Interview: The Triple Threat',
        description: 'Complex AND/OR Logic.',
        difficulty: 'Hard',
        briefing: `
**Problem**
We are looking for "Triple Threat" candidates who meet at least 2 out of the following 3 criteria:
1. Own a car (present in \`drivers_license\`).
2. Have a gym membership (present in \`get_fit_now_member\`).
3. Earn more than $60,000 annually.

Return the names of citizens who satisfy this condition.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| age          | INT     |
| height       | INT     |
| eye_color    | VARCHAR |
| hair_color   | VARCHAR |
| gender       | VARCHAR |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

Table: \`get_fit_now_member\`
+-----------------------+---------+
| Column Name           | Type    |
+-----------------------+---------+
| id                    | VARCHAR |
| person_id             | INT     |
| name                  | VARCHAR |
| membership_start_date | INT     |
| membership_status     | VARCHAR |
+-----------------------+---------+

Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Example Output**
+---------------+
| name          |
+---------------+
| Jeremy Bowers |
+---------------+

**Goal**
List names of multi-qualified citizens (meeting >= 2 criteria).
        `,
        objective: 'List names of multi-qualified citizens.',
        expectedAnswer: 'Jeremy Bowers',
        solutionQuery: `SELECT p.name FROM person p LEFT JOIN drivers_license d ON p.license_id = d.id LEFT JOIN get_fit_now_member g ON p.id = g.person_id LEFT JOIN income i ON p.ssn = i.ssn WHERE (CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN g.id IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN i.annual_income > 60000 THEN 1 ELSE 0 END) >= 2`,
        hint: 'Use LEFT JOINS. In the WHERE clause, sum up CASE statements for each condition and check if sum >= 2.'
    },

    // --- MAIN MYSTERY TRACK ---
    {
        id: 'case_101',
        title: 'Case 101: The Report',
        description: 'Start the investigation.',
        difficulty: 'Medium',
        briefing: `
**Problem**
DETECTIVE. A murder occurred in 'SQL City' on January 15, 2018. We need the police report. Find the description of the crime.

**Schema**
Table: \`crime_scene_report\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| date        | INT     |
| type        | VARCHAR |
| description | VARCHAR |
| city        | VARCHAR |
+-------------+---------+

**Goal**
Find the description of the crime.
        `,
        objective: 'Find the description of the crime.',
        expectedAnswer: 'Security footage shows a suspect... Witness 1 lives at the last house on "Northwestern Dr". Witness 2 is named "Annabel" and lives on "Franklin Ave".',
        solutionQuery: `SELECT description FROM crime_scene_report WHERE date = 20180115 AND type = 'murder' AND city = 'SQL City'`,
        hint: 'Filter by date=20180115, type=\'murder\', and city=\'SQL City\'. Select the description.'
    },
    {
        id: 'case_102',
        title: 'Case 102: The Witnesses',
        description: 'Identify the witnesses.',
        difficulty: 'Medium',
        briefing: `
**Problem**
The report identified two witnesses:
1. Lives at the LAST house on "Northwestern Dr".
2. Named "Annabel" and lives on "Franklin Ave".
Find the name of the first witness (Northwestern Dr).
Hint: The "last" house usually means the highest address number.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| address_number      | INT     |
| address_street_name | VARCHAR |
| ssn                 | VARCHAR |
+---------------------+---------+

**Goal**
Enter the name of the witness on Northwestern Dr.
        `,
        objective: 'Enter the name of the witness on Northwestern Dr.',
        expectedAnswer: 'Morty Schapiro',
        hint: 'Filter for street "Northwestern Dr". Order by address_number DESC and Limit 1 to find the last house.'
    },
    {
        id: 'case_103',
        title: 'Case 103: The Interview',
        description: 'Gather witness testimony.',
        difficulty: 'Medium',
        briefing: `
**Problem**
We have identified the witnesses: 'Morty Schapiro' and 'Annabel Miller'. Now we need to hear what they saw.
This table uses \`person_id\`, not names. You must first get the IDs of the witnesses from the \`person\` table, then query the \`interview\` table. Or use a JOIN to do it in one shot.

**Schema**
Table: \`person\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| id         | INT     |
| name       | VARCHAR |
...

Table: \`interview\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| person_id  | INT     |
| transcript | VARCHAR |
+------------+---------+

**Goal**
What is the gym membership number clue mentioned by Morty?
        `,
        objective: 'What is the gym membership number clue mentioned by Morty?',
        expectedAnswer: '48Z',
        hint: 'Join person and interview tables on person.id = interview.person_id. Filter by person.name.'
    },
    {
        id: 'case_104',
        title: 'Case 104: The Suspect',
        description: 'Follow the gym clue.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Clues from Morty:
1. Killer is a "Get Fit Now Gym" member.
2. Membership status: 'gold'.
3. ID starts with "48Z".
4. Left in a car with plate including "H42W".
5. Checked in on January 9, 2018.

**Schema**
Table: \`get_fit_now_member\`
+-------------------+---------+
| Column Name       | Type    |
+-------------------+---------+
| id                | VARCHAR |
| person_id         | INT     |
| name              | VARCHAR |
| membership_status | VARCHAR |
...

Table: \`get_fit_now_check_in\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| membership_id | VARCHAR |
| check_in_date | INT     |
...

Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| plate_number | VARCHAR |
...

Table: \`person\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| id         | INT     |
| name       | VARCHAR |
| license_id | INT     |
...

**Goal**
Identify the killer.
        `,
        objective: 'Identify the killer.',
        expectedAnswer: 'Jeremy Bowers',
        hint: 'Join get_fit_now_member and get_fit_now_check_in. Filter by membership status, ID like "48Z%", and check_in_date. Then cross-reference with person/drivers_license.'
    },
    {
        id: 'case_105',
        title: 'Case 105: The Mastermind',
        description: 'The puppet master.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Jeremy Bowers confessed. He was hired by a woman.
Profile:
1. Height: 65" to 67".
2. Hair: 'red'.
3. Car: 'Tesla Model S'.
4. Attended 'SQL Symphony Concert' 3 times in Dec 2017.

**Schema**
Table: \`drivers_license\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | INT     |
| height      | INT     |
| hair_color  | VARCHAR |
| car_model   | VARCHAR |
| gender      | VARCHAR |
...

Table: \`person\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| id         | INT     |
| name       | VARCHAR |
| license_id | INT     |
...

Table: \`facebook_event_checkin\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| person_id  | INT     |
| event_name | VARCHAR |
| date       | INT     |
...

**Goal**
Identify the Mastermind.
        `,
        objective: 'Identify the Mastermind.',
        expectedAnswer: 'Miranda Priestly',
        hint: 'Filter drivers_license first (red hair, tesla, height). Get the person ID. Check facebook_event_checkin for that ID and count their concert attendance.'
    },

    // --- SIDE OPERATIONS (Patrol Mode) ---
    {
        id: 'patrol_01',
        title: 'Patrol: Lost Item',
        description: 'Retrieve a theft report.',
        difficulty: 'Easy',
        briefing: `
**Problem**
A citizen reported a theft in 'React Rapids' on May 5, 2017 (20170505). They said the thief wore a red hat. Find the description of this specific event.

**Schema**
Table: \`crime_scene_report\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| date        | INT     |
| type        | VARCHAR |
| description | VARCHAR |
| city        | VARCHAR |
+-------------+---------+

**Goal**
What item was stolen?
        `,
        objective: 'What item was stolen?',
        expectedAnswer: 'rare diamond',
        solutionQuery: `SELECT description FROM crime_scene_report WHERE city = 'React Rapids' AND date = 20170505`,
        hint: 'Filter crime_scene_report by city and date.'
    },
    {
        id: 'patrol_02',
        title: 'Patrol: BOLO',
        description: 'Be On the Look Out.',
        difficulty: 'Medium',
        briefing: `
**Problem**
We have a BOLO for a vehicle with plate "ROAR". We need to know the address of the owner to serve a warrant. Find the street name where the owner lives.

**Schema**
Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| plate_number | VARCHAR |
...

Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| license_id          | INT     |
| address_street_name | VARCHAR |
...

**Goal**
Enter the street name.
        `,
        objective: 'Enter the street name.',
        expectedAnswer: 'Pop Star Ln',
        solutionQuery: `SELECT person.address_street_name FROM person JOIN drivers_license ON person.license_id = drivers_license.id WHERE drivers_license.plate_number = 'ROAR'`,
        hint: 'Find the license entry for plate "ROAR", get the ID, then find the person with that license_id.'
    },
    {
        id: 'patrol_03',
        title: 'Patrol: Missing Person',
        description: 'Locate a citizen by SSN.',
        difficulty: 'Easy',
        briefing: `
**Problem**
A person with SSN '123-45-6789' has been reported missing. We need their name to file the report.

**Schema**
Table: \`person\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | INT     |
| name        | VARCHAR |
| ssn         | VARCHAR |
...

**Goal**
What is the name of this citizen?
        `,
        objective: 'What is the name of this citizen?',
        expectedAnswer: 'Katy Perry',
        solutionQuery: `SELECT name FROM person WHERE ssn = '123-45-6789'`,
        hint: 'Simple SELECT on the person table filtering by SSN.'
    },
    {
        id: 'patrol_04',
        title: 'Patrol: VIP Security',
        description: 'List high net worth individuals.',
        difficulty: 'Medium',
        briefing: `
**Problem**
The Mayor wants a list of all citizens earning exactly $5,000,000 annually.

**Schema**
Table: \`income\`
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| ssn           | VARCHAR |
| annual_income | INT     |
+---------------+---------+

**Goal**
What is the SSN of the person earning 5 million?
        `,
        objective: 'What is the SSN of the person earning 5 million?',
        expectedAnswer: '123-45-6789', // Matches Katy Perry data from dbService
        solutionQuery: `SELECT ssn FROM income WHERE annual_income = 5000000`,
        hint: 'Query the income table where annual_income equals 5000000.'
    },
    {
        id: 'patrol_05',
        title: 'Patrol: Gym Capacity',
        description: 'Audit gym membership.',
        difficulty: 'Medium',
        briefing: `
**Problem**
We need to audit the profile of a specific Gold member named 'Jeremy Bowers'.

**Schema**
Table: \`get_fit_now_member\`
+-------------------+---------+
| Column Name       | Type    |
+-------------------+---------+
| id                | VARCHAR |
| name              | VARCHAR |
| membership_status | VARCHAR |
...

**Goal**
Find the membership ID of Jeremy Bowers.
        `,
        objective: 'Find the membership ID of Jeremy Bowers.',
        expectedAnswer: '48Z55',
        solutionQuery: `SELECT id FROM get_fit_now_member WHERE name = 'Jeremy Bowers' AND membership_status = 'gold'`,
        hint: 'Filter by name "Jeremy Bowers" and status "gold". Select the id.'
    },
    // --- CYBER WARFARE DIVISION (Advanced Ops) ---
    {
        id: 'cyber_01',
        title: 'Cyber: The Pattern',
        description: 'Pattern matching analysis.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Intel suggests a sleeper cell uses a specific naming convention for their vehicle plates. They always start with "H42" and end with "9". Find all vehicles matching this pattern.

**Schema**
Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| plate_number | VARCHAR |
| car_make     | VARCHAR |
| car_model    | VARCHAR |
+--------------+---------+

**Example Output**
+--------------+
| plate_number |
+--------------+
| H42W9        |
| H42A9        |
+--------------+

**Goal**
List all matching plate numbers.
        `,
        objective: 'List all matching plate numbers.',
        expectedAnswer: 'H42W9',
        solutionQuery: `SELECT plate_number FROM drivers_license WHERE plate_number LIKE 'H42%9'`,
        hint: 'Use the LIKE operator with wildcards: H42%9'
    },
    {
        id: 'cyber_02',
        title: 'Cyber: The Network',
        description: 'Recursive relationship analysis.',
        difficulty: 'Hard',
        briefing: `
**Problem**
We are mapping the social network of a suspect. Find all people who live on the same street as 'Jeremy Bowers'.
Exclude Jeremy himself from the list.

**Schema**
Table: \`person\`
+---------------------+---------+
| Column Name         | Type    |
+---------------------+---------+
| id                  | INT     |
| name                | VARCHAR |
| address_street_name | VARCHAR |
+---------------------+---------+

**Example Output**
+----------------+
| name           |
+----------------+
| Neighbor Ned   |
+----------------+

**Goal**
List names of Jeremy's neighbors.
        `,
        objective: 'List names of Jeremy\'s neighbors.',
        expectedAnswer: 'Miranda Priestly', // Assuming she might live nearby or purely based on street match logic
        solutionQuery: `SELECT p2.name FROM person p1 JOIN person p2 ON p1.address_street_name = p2.address_street_name WHERE p1.name = 'Jeremy Bowers' AND p2.name != 'Jeremy Bowers'`,
        hint: 'Self-join the person table on address_street_name. Filter p1.name = "Jeremy Bowers".'
    },
    {
        id: 'cyber_03',
        title: 'Cyber: The Infiltration',
        description: 'Exclusionary logic.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Identify "Ghost Cars". Find vehicles (by plate_number) that appear in the \`drivers_license\` table but are NOT linked to any person in the \`person\` table (via license_id).
This implies a fake or unregistered license.

**Schema**
Table: \`drivers_license\`
+--------------+---------+
| Column Name  | Type    |
+--------------+---------+
| id           | INT     |
| plate_number | VARCHAR |
+--------------+---------+

Table: \`person\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| license_id | INT     |
| name       | VARCHAR |
+------------+---------+

**Goal**
List plate numbers of unlinked licenses.
        `,
        objective: 'List plate numbers of unlinked licenses.',
        expectedAnswer: '0H42W', // Dummy answer, logic is key
        solutionQuery: `SELECT plate_number FROM drivers_license WHERE id NOT IN (SELECT license_id FROM person)`,
        hint: 'Use WHERE id NOT IN (SELECT license_id FROM person).'
    },
    {
        id: 'cyber_04',
        title: 'Cyber: The Timeline',
        description: 'Temporal sequence analysis.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Analyze the 'SQL Symphony Concert'. Find the date of the *first* ever check-in for this event.

**Schema**
Table: \`facebook_event_checkin\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| event_name | VARCHAR |
| date       | INT     |
+------------+---------+

**Example Output**
+----------+
| min_date |
+----------+
| 20171201 |
+----------+

**Goal**
What is the earliest date (YYYYMMDD) of the concert?
        `,
        objective: 'What is the earliest date (YYYYMMDD) of the concert?',
        expectedAnswer: '20171204',
        solutionQuery: `SELECT MIN(date) FROM facebook_event_checkin WHERE event_name = 'SQL Symphony Concert'`,
        hint: 'Use the MIN() aggregate function on the date column.'
    },
    {
        id: 'cyber_05',
        title: 'Cyber: The Root Cause',
        description: 'Full spectrum analysis.',
        difficulty: 'Hard',
        briefing: `
**Problem**
Find the name of the person who:
1. Is a "Gold" member of "Get Fit Now".
2. Drives a "Tesla".
3. Has attended the "SQL Symphony Concert".

**Schema**
Table: \`person\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| id         | INT     |
| name       | VARCHAR |
...

Table: \`get_fit_now_member\`
+-------------------+---------+
| Column Name       | Type    |
+-------------------+---------+
| person_id         | INT     |
| membership_status | VARCHAR |
...

Table: \`drivers_license\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | INT     |
| car_make    | VARCHAR |
...

Table: \`facebook_event_checkin\`
+------------+---------+
| Column Name| Type    |
+------------+---------+
| person_id  | INT     |
| event_name | VARCHAR |
...

**Goal**
Identify the high-profile suspect.
        `,
        objective: 'Identify the high-profile suspect.',
        expectedAnswer: 'Miranda Priestly',
        solutionQuery: `SELECT p.name FROM person p JOIN get_fit_now_member g ON p.id = g.person_id JOIN drivers_license d ON p.license_id = d.id JOIN facebook_event_checkin f ON p.id = f.person_id WHERE g.membership_status = 'gold' AND d.car_make = 'Tesla' AND f.event_name = 'SQL Symphony Concert'`,
        hint: 'This requires joining 4 tables: person, get_fit_now_member, drivers_license, and facebook_event_checkin.'
    }
];