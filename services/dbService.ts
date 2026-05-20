import { QueryResult } from '../types';

declare global {
    interface Window {
        alasql: any;
    }
}

let isInitialized = false;

// --- DETERMINISTIC RNG ---
class SeededRNG {
    private _seed: number;
    constructor(seed: number) {
        this._seed = seed;
    }

    // Simple LCG
    next() {
        this._seed = (this._seed * 9301 + 49297) % 233280;
        return this._seed / 233280;
    }

    randInt(min: number, max: number) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    pick(arr: any[]) {
        return arr[Math.floor(this.next() * arr.length)];
    }
}

const rng = new SeededRNG(12345); // Fixed seed for consistent gameplay

// --- DATA GENERATOR ---
const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Annabel', 'Morty', 'Miranda', 'Jeremy', 'Violet', 'Katy', 'Perry'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Schapiro', 'Bowers', 'Priestly', 'Squealer', 'Perry'];
const streets = ['Main St', 'Oak St', 'Pine St', 'Maple Ave', 'Cedar Ln', 'Elm St', 'Washington Ave', 'Lake View', 'Northwestern Dr', 'Franklin Ave', 'Sunset Blvd', 'Beetle Juice Dr'];
const cities = ['SQL City', 'Pythonville', 'Java Town', 'React Rapids', 'Query Creek', 'Springfield'];
const carMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Tesla', 'BMW', 'Nissan', 'Dodge'];
const carModels = ['Camry', 'Civic', 'F-150', 'Malibu', 'Model S', 'X5', 'Altima', 'Viper'];

// Generate specific scenarios for the game
const generateGameData = () => {
    const people = [];
    const licenses = [];
    const reports = [];
    const interviews = [];
    const gymMembers = [];
    const gymCheckins = [];
    const incomes = [];
    const events = [];

    // --- 0. TRAINING DATA (Deterministic inserts for Academy Levels) ---
    
    // Academy: Richest Person (Bruce Vayne)
    people.push({ id: 99999, name: 'Bruce Vayne', license_id: 99999, address_number: 1, address_street_name: 'Gotham Way', ssn: '000-00-0001' });
    incomes.push({ ssn: '000-00-0001', annual_income: 1000000000 }); // 1 Billion

    // Academy: First person (James Smith)
    people.push({ id: 100, name: 'James Smith', license_id: 200100, address_number: 1, address_street_name: 'Main St', ssn: '000-00-1000' });
    licenses.push({ id: 200100, age: 30, height: 180, eye_color: 'brown', hair_color: 'black', gender: 'male', plate_number: 'JS-100', car_make: 'Toyota', car_model: 'Camry' });
    incomes.push({ ssn: '000-00-1000', annual_income: 45000 });

    // Academy: Specific target for exact match 'Katy Perry'
    const katyLicense = 100001;
    licenses.push({ id: katyLicense, age: 34, height: 170, eye_color: 'blue', hair_color: 'black', gender: 'female', plate_number: 'ROAR', car_make: 'Audi', car_model: 'A4' });
    people.push({ id: 88888, name: 'Katy Perry', license_id: katyLicense, address_number: 10, address_street_name: 'Pop Star Ln', ssn: '123-45-6789' });
    incomes.push({ ssn: '123-45-6789', annual_income: 5000000 });

    // Academy: No-license citizen (John Doe)
    people.push({ id: 55555, name: 'John Doe', license_id: null, address_number: 404, address_street_name: 'Unknown Ave', ssn: '999-00-0000' });
    incomes.push({ ssn: '999-00-0000', annual_income: 15000 });

    // Academy: Roommate for Morty (Summer Smith)
    people.push({ id: 2003, name: 'Summer Smith', license_id: 999003, address_number: 4919, address_street_name: 'Northwestern Dr', ssn: '111-22-4444' });
    licenses.push({ id: 999003, age: 18, height: 160, eye_color: 'green', hair_color: 'orange', gender: 'female', plate_number: 'SUMM3R', car_make: 'Toyota', car_model: 'Corolla' });

    // Interview 12: Licensed but no events (Unlucky Luke)
    people.push({ id: 3001, name: 'Unlucky Luke', license_id: 300101, address_number: 13, address_street_name: 'Pine St', ssn: '111-00-5555' });
    licenses.push({ id: 300101, age: 30, height: 180, eye_color: 'brown', hair_color: 'black', gender: 'male', plate_number: 'LUK-E', car_make: 'Ford', car_model: 'F-150' });

    // Interview 19: Gym member but no check-ins (Lazy Larry)
    people.push({ id: 4001, name: 'Lazy Larry', license_id: 400101, address_number: 99, address_street_name: 'Oak St', ssn: '111-00-6666' });
    licenses.push({ id: 400101, age: 25, height: 175, eye_color: 'blue', hair_color: 'blonde', gender: 'male', plate_number: 'LAZY-1', car_make: 'Chevrolet', car_model: 'Malibu' });
    gymMembers.push({ id: '99Z99', person_id: 4001, name: 'Lazy Larry', membership_start_date: 20170101, membership_status: 'regular' });

    // Interview 18: Middle-upper class (Tesla Model S owner)
    people.push({ id: 5001, name: 'Wealthy Wendy', license_id: 500101, address_number: 55, address_street_name: 'Maple Ave', ssn: '111-00-7777' });
    licenses.push({ id: 500101, age: 45, height: 165, eye_color: 'green', hair_color: 'blonde', gender: 'female', plate_number: 'RICH-1', car_make: 'Tesla', car_model: 'Model S' });
    incomes.push({ ssn: '111-00-7777', annual_income: 90000 });

    // Cyber 01: Specific pattern plate (Sleeper Cell)
    licenses.push({ id: 600101, age: 28, height: 180, eye_color: 'brown', hair_color: 'black', gender: 'male', plate_number: 'H42W9', car_make: 'BMW', car_model: 'X5' });
    people.push({ id: 6001, name: 'Sleeper Agent One', license_id: 600101, address_number: 777, address_street_name: 'Sunset Blvd', ssn: '111-00-8888' });

    // --- 1. Noise Data (1000 people) ---
    // We use the seeded RNG so this is the SAME every reload.
    for (let i = 1; i <= 1000; i++) {
        const hasLicense = rng.next() > 0.2;
        let licenseId = null;

        if (hasLicense) {
            licenseId = 200000 + i;
            licenses.push({
                id: licenseId,
                age: rng.randInt(18, 90),
                height: rng.randInt(150, 200),
                eye_color: rng.pick(['blue', 'brown', 'green', 'black']),
                hair_color: rng.pick(['black', 'brown', 'blonde', 'red', 'grey']),
                gender: rng.pick(['male', 'female']),
                plate_number: `${String.fromCharCode(rng.randInt(65,90))}${String.fromCharCode(rng.randInt(65,90))}${String.fromCharCode(rng.randInt(65,90))}-${rng.randInt(100,999)}`,
                car_make: rng.pick(carMakes),
                car_model: rng.pick(carModels)
            });
        }

        const personId = i;
        const ssn = `${rng.randInt(100,999)}-${rng.randInt(10,99)}-${rng.randInt(1000,9999)}`;
        people.push({
            id: personId,
            name: `${rng.pick(firstNames)} ${rng.pick(lastNames)}`,
            license_id: licenseId,
            address_number: rng.randInt(1, 999),
            address_street_name: rng.pick(streets),
            ssn: ssn
        });

        // Skip adding income for special inserts
        if (personId !== 99999 && personId !== 88888) {
            incomes.push({
                ssn: ssn,
                annual_income: rng.randInt(20000, 150000)
            });
        }

        // Random gym members
        if (rng.next() > 0.8) {
            const memberId = `${rng.randInt(10000, 99999)}`;
            gymMembers.push({
                id: memberId,
                person_id: personId,
                name: people[people.length-1].name,
                membership_start_date: 20170101,
                membership_status: rng.pick(['regular', 'gold', 'silver'])
            });
            // Random checkins
            if (rng.next() > 0.5) {
                gymCheckins.push({
                    membership_id: memberId,
                    check_in_date: 20180109,
                    check_in_time: rng.randInt(600, 2200),
                    check_out_time: rng.randInt(700, 2300)
                });
                // Add a second checkin for some to support HAVING COUNT > 1 queries
                if (rng.next() > 0.7) {
                    gymCheckins.push({
                        membership_id: memberId,
                        check_in_date: 20180110,
                        check_in_time: rng.randInt(600, 2200),
                        check_out_time: rng.randInt(700, 2300)
                    });
                }
            }
        }

        // Random Event Checkins
        if (rng.next() > 0.9) {
            const eventId = rng.randInt(100, 105);
            const eventName = rng.pick(['SQL Symphony Concert', 'Python Party', 'React Rave']);
            events.push({
                person_id: personId,
                event_id: eventId,
                event_name: eventName,
                date: 20171201 + rng.randInt(0, 30)
            });
            // Add duplicate checkins for some people (for HAVING count > 1)
            if (rng.next() > 0.8) {
                 events.push({
                    person_id: personId,
                    event_id: eventId,
                    event_name: eventName,
                    date: 20171201 + rng.randInt(0, 30)
                });
            }
        }
    }

    // --- 2. Murder Mystery Data (Overwriting or adding to noise) ---
    
    // Case 1: The Report
    reports.push({
        date: 20180115,
        type: 'murder',
        description: 'Security footage shows a suspect... Witness 1 lives at the last house on "Northwestern Dr". Witness 2 is named "Annabel" and lives on "Franklin Ave".',
        city: 'SQL City'
    });

    // Add noise reports
    for(let i=0; i<50; i++) {
        reports.push({
            date: 20180101 + i,
            type: rng.pick(['theft', 'assault', 'burglary', 'fraud']),
            description: `Incident reported at ${rng.pick(streets)}. Investigating officer #${rng.randInt(1,99)}.`,
            city: rng.pick(cities)
        });
    }
    
    // Specific Report for a Side Mission (Academy Level - Wildcard/Like)
    reports.push({
        date: 20170505,
        type: 'theft',
        description: 'A rare diamond was stolen. The suspect was seen wearing a red hat.',
        city: 'React Rapids'
    });

    // Case 2: The Witnesses
    // Witness 1: Morty Schapiro, Last house on Northwestern Dr
    const mortyLicenseId = 999001;
    licenses.push({ id: mortyLicenseId, age: 40, height: 170, eye_color: 'blue', hair_color: 'brown', gender: 'male', plate_number: 'M0RTY', car_make: 'Toyota', car_model: 'Prius' });
    people.push({ id: 2001, name: 'Morty Schapiro', license_id: mortyLicenseId, address_number: 4919, address_street_name: 'Northwestern Dr', ssn: '111-22-3333' });
    
    // Witness 2: Annabel Miller, Franklin Ave
    const annabelLicenseId = 999002;
    licenses.push({ id: annabelLicenseId, age: 30, height: 165, eye_color: 'green', hair_color: 'blonde', gender: 'female', plate_number: 'ANNA', car_make: 'Honda', car_model: 'Civic' });
    people.push({ id: 2002, name: 'Annabel Miller', license_id: annabelLicenseId, address_number: 102, address_street_name: 'Franklin Ave', ssn: '222-33-4444' });

    // Case 3: Transcripts
    interviews.push({ person_id: 2001, transcript: 'I heard a gunshot and then saw a man run out. He had a "Get Fit Now Gym" bag. The membership number on the bag started with "48Z". Only Gold members have those bags. The man got into a car with a plate that included "H42W".' });
    interviews.push({ person_id: 2002, transcript: 'I saw the murder happen, and I recognized the killer from my gym when I was working out last week on January 9th.' });

    // Case 4: The Killer (Jeremy Bowers)
    // Needs: Gym Member (48Z..., Gold), Checkin Jan 9, Plate has H42W
    const jeremyLicenseId = 666666;
    licenses.push({ id: jeremyLicenseId, age: 30, height: 185, eye_color: 'blue', hair_color: 'brown', gender: 'male', plate_number: '0H42W2', car_make: 'Chevrolet', car_model: 'Malibu' });
    people.push({ id: 6666, name: 'Jeremy Bowers', license_id: jeremyLicenseId, address_number: 12, address_street_name: 'Main St', ssn: '666-66-6666' });
    gymMembers.push({ id: '48Z55', person_id: 6666, name: 'Jeremy Bowers', membership_start_date: 20160101, membership_status: 'gold' });
    gymCheckins.push({ membership_id: '48Z55', check_in_date: 20180109, check_in_time: 1530, check_out_time: 1700 });
    // Guarantee Interview 13: Peak hour 17 (5 PM)
    for(let i=0; i<10; i++) {
        gymCheckins.push({ membership_id: `99A${i}`, check_in_date: 20180109, check_in_time: 1700 + i, check_out_time: 1800 });
    }
    // Jeremy interview for next step
    interviews.push({ person_id: 6666, transcript: 'I was hired by a woman with a lot of money. I don\'t know her name, but I know she\'s around 5\'5" (65") to 5\'7" (67"). She has red hair and she drives a Tesla Model S. I know that she attended the SQL Symphony Concert 3 times in December 2017.' });

    // Case 5: The Mastermind (Miranda Priestly)
    // Needs: High Income, 65-67 height, red hair, Tesla Model S, 3x Event Checkin Dec 2017
    const mirandaLicenseId = 777777;
    licenses.push({ id: mirandaLicenseId, age: 50, height: 66, eye_color: 'green', hair_color: 'red', gender: 'female', plate_number: 'PRADA', car_make: 'Tesla', car_model: 'Model S' });
    people.push({ id: 7777, name: 'Miranda Priestly', license_id: mirandaLicenseId, address_number: 1, address_street_name: 'Fifth Ave', ssn: '777-77-7777' });
    incomes.push({ ssn: '777-77-7777', annual_income: 5000000 });
    gymMembers.push({ id: '99999', person_id: 7777, name: 'Miranda Priestly', membership_start_date: 20170101, membership_status: 'gold' });
    
    const eventId = 999;
    events.push({ person_id: 7777, event_id: eventId, event_name: 'SQL Symphony Concert', date: 20171204 });
    events.push({ person_id: 7777, event_id: eventId, event_name: 'SQL Symphony Concert', date: 20171212 });
    events.push({ person_id: 7777, event_id: eventId, event_name: 'SQL Symphony Concert', date: 20171228 });

    return { people, licenses, reports, interviews, gymMembers, gymCheckins, incomes, events };
};

export const initDB = () => {
    if (isInitialized) return;
    if (window.alasql) {
        try {
            console.log("Seeding Database...");
            window.alasql('CREATE DATABASE IF NOT EXISTS sql_game');
            window.alasql('USE sql_game');
            
            // Create Tables
            window.alasql('CREATE TABLE crime_scene_report (date INT, type STRING, description STRING, city STRING)');
            window.alasql('CREATE TABLE drivers_license (id INT, age INT, height INT, eye_color STRING, hair_color STRING, gender STRING, plate_number STRING, car_make STRING, car_model STRING)');
            window.alasql('CREATE TABLE person (id INT, name STRING, license_id INT, address_number INT, address_street_name STRING, ssn STRING)');
            window.alasql('CREATE TABLE facebook_event_checkin (person_id INT, event_id INT, event_name STRING, date INT)');
            window.alasql('CREATE TABLE interview (person_id INT, transcript STRING)');
            window.alasql('CREATE TABLE get_fit_now_member (id STRING, person_id INT, name STRING, membership_start_date INT, membership_status STRING)');
            window.alasql('CREATE TABLE get_fit_now_check_in (membership_id STRING, check_in_date INT, check_in_time INT, check_out_time INT)');
            window.alasql('CREATE TABLE income (ssn STRING, annual_income INT)');

            // Seed Data
            const data = generateGameData();
            
            window.alasql('INSERT INTO crime_scene_report SELECT * FROM ?', [data.reports]);
            window.alasql('INSERT INTO drivers_license SELECT * FROM ?', [data.licenses]);
            window.alasql('INSERT INTO person SELECT * FROM ?', [data.people]);
            window.alasql('INSERT INTO interview SELECT * FROM ?', [data.interviews]);
            window.alasql('INSERT INTO get_fit_now_member SELECT * FROM ?', [data.gymMembers]);
            window.alasql('INSERT INTO get_fit_now_check_in SELECT * FROM ?', [data.gymCheckins]);
            window.alasql('INSERT INTO income SELECT * FROM ?', [data.incomes]);
            window.alasql('INSERT INTO facebook_event_checkin SELECT * FROM ?', [data.events]);

            isInitialized = true;
            console.log("Database initialized with procedural data.");
        } catch (e) {
            console.error("Failed to initialize DB", e);
        }
    }
};

export const runQuery = (sql: string): QueryResult => {
    const startTime = performance.now();
    try {
        if (!sql.trim()) return { columns: [], data: [] };
        
        // --- 1. CLEANING ---
        // Remove comments (Simple -- and /* */) to prevent keywords hiding in comments
        let cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

        // --- 2. MASKING STRINGS ---
        // Replaces content inside single quotes with empty strings for validation.
        // This ensures that queries like "WHERE name = 'Drop Table'" are allowed.
        const maskedSql = cleanSql.replace(/'[^']*'/g, "''");

        // --- 3. VALIDATION ---
        // Use word boundaries (\b) to ensure we match specific SQL commands, not substrings.
        const forbiddenPattern = /\b(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COMMIT|ROLLBACK)\b/i;
        
        if (forbiddenPattern.test(maskedSql)) {
             return {
                columns: [],
                data: [],
                error: "PERMISSION DENIED: Modification commands are disabled. Read-only access authorized."
            };
        }

        const data = window.alasql(sql);
        const executionTime = performance.now() - startTime;

        if (!Array.isArray(data)) {
            return { columns: [], data: [], executionTime };
        }

        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        return {
            columns,
            data,
            executionTime
        };

    } catch (error: any) {
        return {
            columns: [],
            data: [],
            error: error.message || "Syntax Error",
            executionTime: performance.now() - startTime
        };
    }
};