const { AssignmentMapping } = require('../models/AssignmentMapping');
const { SubjectiveMapping } = require('../models/SubjectiveMapping');
const { ObjectiveMapping } = require('../models/ObjectiveMapping');
const PresentationMapping = require('../models/PresentationMarks');
const { EndExamMapping } = require('../models/EndExamMapping');
const { TLPSurvey, CourseEndSurvey } = require('../models/indirectAttainment');
const CopoMapping = require('../models/COPOMapping');
const CourseOutcome = require('../models/CourseOutcome');

// Helper function to calculate LOI
const calculateLOI = (percentage) => {
    if (percentage <= 60) return 1;
    if (percentage <= 70) return 2;
    return 3;
};

// Function to calculate CO averages and LOIs for Assignment and Objective Mapping
const calculateComponentAveragesAndLOIs = (data, mappingsKey) => {
    console.log('calculateComponentAveragesAndLOIs called with:');
    console.log('  data:', data);
    console.log('  mappingsKey:', mappingsKey);

    if (!data || !data[mappingsKey]) {
        console.log('Data or mappings key is missing. Returning empty.');
        return { coAverages: {}, lois: {} };
    }

    const coMap = {};
    console.log(`Iterating through data.${mappingsKey}:`, data[mappingsKey]);
    for (const assessment of data[mappingsKey]) {
        console.log('  Current assessment:', assessment);
        const maxMarks = assessment.maxMarks;
        console.log('  maxMarks:', maxMarks);
        console.log('  Iterating through assessment.coMappings:', assessment.coMappings);
        for (const coMapping of assessment.coMappings) {
            console.log('    Current coMapping:', coMapping);
            const coNumber = coMapping.coNumber ? coMapping.coNumber.toString() : undefined; // Safe access
            const value = coMapping.value;

            if (coNumber !== undefined && value === '1' && maxMarks > 0) {
                const percentageContribution = (parseInt(value) / 1) * (100 / maxMarks);
                coMap[coNumber] = coMap[coNumber] || [];
                coMap[coNumber].push(percentageContribution);
                console.log('    CO:', coNumber, 'Percentage Contribution:', percentageContribution, 'coMap:', coMap);
            } else if (coNumber === undefined) {
                console.error('Error: coNumber is undefined in assignment/objective mapping:', coMapping);
            }
        }
    }

    const coAverages = {};
    const lois = {};
    console.log('Calculating averages and LOIs for coMap:', coMap);
    for (const co in coMap) {
        console.log('  Processing CO:', co, 'with percentages:', coMap[co]);
        coAverages[co] = coMap[co].reduce((sum, val) => sum + val, 0) / coMap[co].length || 0;
        lois[co] = calculateLOI(coAverages[co]);
        console.log('  coAverages[', co, ']:', coAverages[co]);
        console.log('  lois[', co, ']:', lois[co]);
    }

    console.log('Returning results:', { coAverages, lois });
    return { coAverages, lois };
};

// Function to calculate CO averages and LOIs for Subjective Mapping
const calculateSubjectiveAveragesAndLOIs = (data) => {
    console.log('calculateSubjectiveAveragesAndLOIs called with:', data);

    if (!data || !data.mappings) {
        console.log('Subjective data or mappings are missing.');
        return { coAverages: {}, lois: {} };
    }

    const coMap = {};
    for (const exam of data.mappings) {
        console.log('  Processing exam:', exam);
        for (const question of exam.questions) {
            console.log('    Processing question:', question);
            const maxMarks = question.maxMarks;
            for (const coMapping of question.coMappings) {
                const coNumber = coMapping.coNumber ? coMapping.coNumber.replace('CO', '').toString() : undefined; // Safe access
                const value = coMapping.value;

                if (coNumber !== undefined && value === '1' && maxMarks > 0) {
                    const percentageContribution = (parseInt(value) / 1) * (100 / maxMarks);
                    coMap[coNumber] = coMap[coNumber] || [];
                    coMap[coNumber].push(percentageContribution);
                    console.log('      CO:', coNumber, 'Percentage Contribution:', percentageContribution, 'coMap:', coMap);
                } else if (coNumber === undefined) {
                    console.error('Error: coNumber is undefined in subjective mapping:', coMapping);
                }
            }
        }
    }

    const coAverages = {};
    const lois = {};
    for (const co in coMap) {
        coAverages[co] = coMap[co].reduce((sum, val) => sum + val, 0) / coMap[co].length || 0;
        lois[co] = calculateLOI(coAverages[co]);
        console.log('  Subjective CO:', co, 'Average:', coAverages[co], 'LOI:', lois[co]);
    }

    console.log('Subjective Results:', { coAverages, lois });
    return { coAverages, lois };
};

// Function to calculate CO averages and LOIs for Presentation Mapping (Default mapping to all COs)
const calculatePresentationAveragesAndLOIs = (data, coNumbers) => {
    console.log('calculatePresentationAveragesAndLOIs called with:', data);

    if (!data || !data.marks || !coNumbers || coNumbers.length === 0) {
        console.log('Presentation data, marks, or CO numbers are missing.');
        return { coAverages: {}, lois: {} };
    }

    const coMap = {};
    const totalStudents = data.marks.length;
    if (totalStudents === 0) {
        console.log('No presentation marks found.');
        return { coAverages: {}, lois: {} };
    }

    for (const coNumber of coNumbers) {
        let sumOfMarks = 0;
        for (const mark of data.marks) {
            sumOfMarks += mark.presentation || 0;
        }
        // Assuming equal contribution to each CO. Adjust the weight if needed.
        coMap[coNumber] = (sumOfMarks / totalStudents) * (100 / 5); // Assuming max presentation mark is 5
    }

    const coAverages = {};
    const lois = {};
    for (const co in coMap) {
        coAverages[co] = coMap[co];
        lois[co] = calculateLOI(coAverages[co]);
        console.log('  Presentation CO:', co, 'Average:', coAverages[co], 'LOI:', lois[co]);
    }

    console.log('Returning presentation results:', { coAverages, lois });
    return { coAverages, lois };
};

exports.generatePrintAttainmentData = async (req, res) => {
    try {
        const { regulation, semester, category, courseTitle, batch, academicYear } = req.query;
        const filters = { regulation, semester, category, courseTitle, batch, academicYear };
        const filters1 = { regulation, semester, courseName: courseTitle, batch, academicYear };

        // 1. Fetch Direct Mapping Data and CO-PO Mapping
        const assignmentData = await AssignmentMapping.findOne(filters1);
        const subjectiveData = await SubjectiveMapping.findOne(filters1);
        const objectiveData = await ObjectiveMapping.findOne(filters1);
        const presentationData = await PresentationMapping.findOne(filters);
        const endExamData = await EndExamMapping.findOne(filters1);
        const copoMappingData = await CopoMapping.findOne({ regulation, semester, courseName: courseTitle });
        const courseOutcomes = await CourseOutcome.find({ regulation, semester, subjectTitle: courseTitle }).select('outcomes coNumber statement').lean();

        const coStatements = courseOutcomes.reduce((acc, co) => {
            if (co && co.coNumber !== undefined) {
                acc[co.coNumber.toString()] = co.statement;
            } else {
                console.error('Error: coNumber is undefined for a CourseOutcome:', co);
            }
            return acc;
        }, {});

        const coNumbers = courseOutcomes.map(co => co.coNumber ? co.coNumber.toString() : undefined).filter(co => co !== undefined);

        // Internal table creation and calculations for Direct Mapping
        const assignmentResults = calculateComponentAveragesAndLOIs(assignmentData, 'mappings');
        const subjectiveResults = calculateSubjectiveAveragesAndLOIs(subjectiveData);
        const objectiveResults = calculateComponentAveragesAndLOIs(objectiveData, 'mappings');
        const presentationResults = calculatePresentationAveragesAndLOIs(presentationData, coNumbers);
        const endExamCoAverages = {};
        const endExamLOIs = {};
        const endExamWeightedLOIs = {};
        if (endExamData && endExamData.questions && endExamData.MappingPercentages) {
            const numStudents = endExamData.MappingPercentages.length;
            const coMarks = {};
            for (const question of endExamData.questions) {
                const questionMappings = endExamData.MappingPercentages.map(student => student[question.questionNumber] || 0);
                const questionAverage = questionMappings.reduce((sum, val) => sum + val, 0) / numStudents || 0;
                for (const co of question.cos) {
                    const coNumber = co ? co.toString() : undefined; // Safe access
                    if (coNumber !== undefined) {
                        coMarks[coNumber] = coMarks[coNumber] || [];
                        coMarks[coNumber].push(questionAverage);
                    } else {
                        console.error('Error: co is undefined in end exam question:', question);
                    }
                }
            }
            for (const co in coMarks) {
                endExamCoAverages[co] = coMarks[co].reduce((sum, val) => sum + val, 0) / coMarks[co].length || 0;
                endExamLOIs[co] = calculateLOI(endExamCoAverages[co]);
                endExamWeightedLOIs[co] = (endExamLOIs[co] * 0.5).toFixed(2); // Weight for SEE
            }
        }

        // Overall Direct Mapping Calculation
        const overallDirectMapping = { coLevels: {}, lois: {} };
        for (const co of coNumbers) {
            const subjAvg = subjectiveResults.coAverages[co] || 0;
            const objAvg = objectiveResults.coAverages[co] || 0;
            const assAvg = assignmentResults.coAverages[co] || 0;
            const presAvg = presentationResults.coAverages[co] || 0;
            const seeAvg = endExamCoAverages[co] || 0;

            const overall = (subjAvg * 0.2) + (objAvg * 0.1) + (assAvg * 0.1) + (presAvg * 0.1) + (seeAvg * 0.5);
            overallDirectMapping.coLevels[co] = overall.toFixed(2);
            overallDirectMapping.lois[co] = calculateLOI(overall);
        }

        // 2. Fetch Indirect Mapping Data
        const tlpFeedbackData = await TLPSurvey.findOne(filters);
        const cesData = await CourseEndSurvey.findOne(filters);

        const tlpAveragePercentage = tlpFeedbackData ? tlpFeedbackData.overallAverage : 0;
        const tlpLOI = calculateLOI(tlpAveragePercentage);
        const tlpLOIsForAllCos = coNumbers.reduce((acc, co) => ({ ...acc, [co]: tlpLOI }), {});

        const cesCoPercentages = cesData ? cesData.coPercentages.reduce((acc, item) => ({ ...acc, [item.coNumber ? item.coNumber.toString() : 'undefined']: item.percentage }), {}) : {};
        const cesLOIs = Object.fromEntries(Object.entries(cesCoPercentages).map(([co, percentage]) => [co, calculateLOI(percentage)]));

        // Overall Indirect Mapping Calculation
        const overallIndirectMapping = { coLevels: {}, lois: {} };
        for (const co of coNumbers) {
            const tlpPct = tlpAveragePercentage || 0;
            const cesPct = cesCoPercentages[co] || 0;
            const overall = (0.5 * tlpPct) + (0.5 * cesPct);
            overallIndirectMapping.coLevels[co] = overall.toFixed(2);
            overallIndirectMapping.lois[co] = calculateLOI(overall);
        }

        // 3. Calculate Overall Mapping Levels
        const overallMapping = {};
        for (const co of coNumbers) {
            const directPct = parseFloat(overallDirectMapping.coLevels[co]) || 0;
            const indirectPct = parseFloat(overallIndirectMapping.coLevels[co]) || 0;
            overallMapping[co] = (0.8 * directPct) + (0.2 * indirectPct);
        }

        // 4. PO Mappings Calculation
        const poMappings = {};
        if (copoMappingData && copoMappingData.mapping) {
            const poSums = {};
            const poCounts = {};
            for (const po of Object.keys(copoMappingData.mapping[0] || {}).filter(key => key.startsWith('PO'))) {
                poSums[po] = 0;
                poCounts[po] = 0;
            }

            for (const coMapping of copoMappingData.mapping) {
                const coOverallMapping = overallMapping[coMapping.co ? coMapping.co.toString() : 'undefined'] || 0; // Safe access
                if (coOverallMapping !== 0 && coMapping.co) {
                    for (const po in coMapping) {
                        if (po.startsWith('PO') && coMapping[po] > 0) {
                            poSums[po] += coOverallMapping * coMapping[po];
                            poCounts[po]++;
                        }
                    }
                } else if (!coMapping.co) {
                    console.error('Error: co is missing in copo mapping:', coMapping);
                }
            }

            for (const po in poSums) {
                poMappings[po] = poSums[po] / poCounts[po] || 0;
            }
        }

        const printData = {
            filters,
            directMappings: {
                subjective: subjectiveResults,
                objective: objectiveResults,
                assignment: assignmentResults,
                presentation: presentationResults,
                endExam: { coAverages: endExamCoAverages, lois: endExamLOIs, weightedLOIs: endExamWeightedLOIs },
                overallDirectMapping,
            },
            indirectMappings: {
                tlpFeedback: { averagePercentage: tlpAveragePercentage, lois: tlpLOIsForAllCos },
                courseEndSurvey: { coPercentages: cesCoPercentages, lois: cesLOIs },
                overallIndirectMapping,
            },
            overallMapping,
            coPoMapping: { mapping: copoMappingData ? copoMappingData.mapping : [], poAverages: poMappings },
            coStatements,
        };
        res.status(200).json(printData);

    } catch (error) {
        console.error('Error generating print Mapping data:', error);
        res.status(500).json({ error: 'Failed to generate print Mapping data', details: error.message });
    }
};