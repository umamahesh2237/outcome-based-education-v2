const { AssignmentMapping, AssignmentMarks } = require('../models/AssignmentMapping');
const COPOMapping = require('../models/COPOMapping');
const CourseOutcome = require('../models/CourseOutcome');
const { EndExamMapping, EndExamMarks } = require('../models/EndExamMapping');
const { TLPSurvey, CourseEndSurvey } = require('../models/indirectAttainment');
const { ObjectiveMapping, ObjectiveMarks } = require('../models/ObjectiveMapping');
const PresentationMarks = require('../models/PresentationMarks');
const { SubjectiveMapping, SubjectiveMarks } = require('../models/SubjectiveMapping');

// Helper function to calculate LOI
const calculateLOI = (percentage) => { 
    if (percentage >= 80) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 60) return 1;
    return 0;
};

exports.getPrintAttainmentData = async (req, res) => {
    try {
        const { regulation, semester, category, batch, academicYear } = req.query;
        const courseName = req.query.courseTitle || req.query.courseName; // Fallback to courseName if courseTitle is not provided
        const coPoMapping = await COPOMapping.findOne({ regulation, semester, category, courseName });
        const courseOutcomes = await CourseOutcome.findOne({ regulation, semester, subjectTitle: courseName });
        const assignmentMappings = await AssignmentMapping.findOne({ regulation, academicYear, semester, courseName, batch });
        const assignmentMarksData = await AssignmentMarks.findOne({ regulation, academicYear, semester, courseName, batch });
        const subjectiveMappings = await SubjectiveMapping.findOne({ regulation, academicYear, semester, courseName, batch });
        const subjectiveMarksData = await SubjectiveMarks.findOne({ regulation, academicYear, semester, courseName, batch });
        const objectiveMappings = await ObjectiveMapping.findOne({ regulation, academicYear, semester, courseName, batch });
        const objectiveMarksData = await ObjectiveMarks.findOne({ regulation, academicYear, semester, courseName, batch });
        const presentationMarksData = await PresentationMarks.findOne({ regulation, semester, category, courseTitle: courseName, batch, academicYear });
        const endExamMappings = await EndExamMapping.findOne({ regulation, academicYear, semester, courseName, batch });
        const endExamMarksData = await EndExamMarks.findOne({ regulation, academicYear, semester, courseName, batch });
        const tlpSurveyData = await TLPSurvey.findOne({ regulation, semester, academicYear, courseTitle: courseName, batch });
        const courseEndSurveyData = await CourseEndSurvey.findOne({ regulation, semester, academicYear, courseTitle: courseName, batch });
        const coStatements = courseOutcomes?.outcomes?.[0] || {}; // Safe access
        var numCOs = 0;
        for (const key in coStatements) {
            if (key.startsWith('CO') && coStatements[key]) {
              numCOs++;
            }
        }
        const rollNumbers = assignmentMarksData?.marks.map(m => m.rollNo) ||
                            subjectiveMarksData?.marks.map(m => m.rollNo) ||
                            objectiveMarksData?.marks.map(m => m.rollNo) ||
                            presentationMarksData?.marks.map(m => m.rollNo) || [];
        const attemptedStudentsCount = rollNumbers.length;

        // --- Calculating Direct Attainments ---
        const assignmentAttainments = {};
        if (assignmentMappings && assignmentMarksData) {
            for (let i = 1; i <= 2; i++) {
                const assignmentNumber = `assignment${i}`;
                const mapping = assignmentMappings.mappings.find(m => m.assignmentNumber === `Assignment-${i}`);
                const maxMarks = mapping?.maxMarks || 5;
                assignmentAttainments[assignmentNumber] = {};
                for (let j = 1; j <= numCOs; j++) {
                    const coNumber = `${j-1}`;
                    const isMapped = mapping?.coMappings.some(co => co.coNumber === coNumber && co.value === '1');
                    if (isMapped) {
                        const target = 0.6 * maxMarks;
                        const reachingTargetCount = assignmentMarksData.marks.filter(student => student[assignmentNumber] >= target).length;
                        const attainmentPercentage = attemptedStudentsCount > 0 ? (reachingTargetCount / attemptedStudentsCount) * 100 : 0;
                        assignmentAttainments[assignmentNumber][coNumber] = attainmentPercentage;
                    } else {
                        assignmentAttainments[assignmentNumber][coNumber] = null;
                    }
                }
            }
        }
        //console.log("Assignment Attainments: ", assignmentAttainments);
        const subjectiveAttainments = {};
        if (subjectiveMappings && subjectiveMarksData) {
            for (let i = 1; i <= 2; i++) {
                const examNumber = `subjective${i}`;
                subjectiveAttainments[examNumber] = {};
                const examMapping = subjectiveMappings.mappings.find(m => m.examNumber === `Subjective-${i}`);
                if (examMapping) {
                    for (let q = 1; q <= 6; q++) {
                        const questionNumber = `Q${q}`;
                        const questionMapping = examMapping.questions.find(qMap => qMap.questionNumber === questionNumber);
                        const maxMarks = questionMapping?.maxMarks || 5;
                        for (let j = 1; j <= numCOs; j++) {
                            const coNumber = `CO${j}`;
                            const isMapped = questionMapping?.coMappings.some(co => co.coNumber === coNumber && co.value === '1');
                            if (isMapped) {
                                const target = 0.6 * maxMarks;
                                const reachingTargetCount = subjectiveMarksData.marks.filter(student => student[examNumber]?.[questionNumber] >= target).length;
                                const attemptedForQ = subjectiveMarksData.marks.filter(student => student[examNumber]?.[questionNumber] !== undefined).length;
                                const attainmentPercentage = attemptedForQ > 0 ? (reachingTargetCount / attemptedForQ) * 100 : 0;
                                if (!subjectiveAttainments[examNumber][coNumber]) {
                                    subjectiveAttainments[examNumber][coNumber] = [];
                                }
                                subjectiveAttainments[examNumber][coNumber].push(attainmentPercentage);
                            }
                        }
                    }
                }
            }
        }
        //console.log("Subjective Attainments: ", subjectiveAttainments);
        const objectiveAttainments = {};
        if (objectiveMappings && objectiveMarksData) {
            for (let i = 1; i <= 2; i++) {
                const objectiveNumber = `objective${i}`;
                const mapping = objectiveMappings.mappings.find(m => m.objectiveNumber === `Objective-${i}`);
                const maxMarks = mapping?.maxMarks || 10;
                objectiveAttainments[objectiveNumber] = {};
                for (let j = 1; j <= numCOs; j++) {
                    const coNumber = `${j-1}`;
                    const isMapped = mapping?.coMappings.some(co => co.coNumber === coNumber && co.value === '1');
                    if (isMapped) {
                        const target = 0.6 * maxMarks;
                        const reachingTargetCount = objectiveMarksData.marks.filter(student => student[objectiveNumber] >= target).length;
                        const attainmentPercentage = attemptedStudentsCount > 0 ? (reachingTargetCount / attemptedStudentsCount) * 100 : 0;
                        objectiveAttainments[objectiveNumber][coNumber] = attainmentPercentage;
                    } else {
                        objectiveAttainments[objectiveNumber][coNumber] = null;
                    }
                }
            }
        }
        //console.log("Objective Attainments: ", objectiveAttainments);
        const presentationAttainment = {};
        if (presentationMarksData) {
            const maxMarks = 5; // Fixed for presentation
            const target = 0.6 * maxMarks;
            const reachingTargetCount = presentationMarksData.marks.filter(student => student.presentation >= target).length;
            const attemptedForPresentation = presentationMarksData.marks.filter(student => student.presentation !== undefined).length;
            const attainmentPercentage = attemptedForPresentation > 0 ? (reachingTargetCount / attemptedForPresentation) * 100: 0;
            for (let i = 1; i <= numCOs; i++) {
                presentationAttainment[`CO${i}`] = attainmentPercentage;
            }
        }
        //console.log("Presentation Attainment: ", presentationAttainment);
        const endExamAttainments = {};
        if (endExamMappings && endExamMarksData) {
            for (const mapping of endExamMappings.mapping) {
                const questionNumber = mapping.questionNumber;
                const maxMarks = mapping.maxMarks;
                endExamAttainments[questionNumber] = {};
                for (let j = 1; j <= numCOs; j++) {
                    const coNumber = `${j-1}`;
                    const isMapped = mapping.coMappings.some(co => co.coNumber === coNumber && co.value === '1');
                    if (isMapped) {
                        const target = 0.6 * maxMarks;
                        const reachingTargetCount = endExamMarksData.marks.filter(student => student[questionNumber] >= target).length;
                        const attemptedForQ = endExamMarksData.marks.filter(student => student[questionNumber] !== undefined).length;
                        const attainmentPercentage = attemptedForQ > 0 ? (reachingTargetCount / attemptedForQ) * 100 : 0;
                        const attainmentLevel = calculateLOI(attainmentPercentage);
                        endExamAttainments[questionNumber][coNumber] = attainmentLevel;
                    } else {
                        endExamAttainments[questionNumber][coNumber] = null;
                    }
                }
            }
        }
        //console.log("End Exam Attainments: ", endExamAttainments);
        // --- Calculating Averages for Print ---
        const avgAssignmentAttainments = {};
        for (let i = 1; i <= numCOs; i++) {
            const coNumber = `${i-1}`;
            const percentages = [assignmentAttainments?.assignment1?.[coNumber], assignmentAttainments?.assignment2?.[coNumber]].filter(p => p !== null && p !== undefined);
            avgAssignmentAttainments[coNumber] = percentages.length > 0 ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length : null;
        }
        //console.log("Avg Assignment Attainments: ", avgAssignmentAttainments);
        const avgSubjectiveAttainments = {};
          for (let i = 1; i <= numCOs; i++) {
            const coNumber = `CO${i}`;
            let percentages = [];
            if(subjectiveAttainments?.subjective1?.[coNumber]){
                 percentages = percentages.concat(subjectiveAttainments?.subjective1[coNumber]);
            }
            if(subjectiveAttainments?.subjective2?.[coNumber]){
                 percentages = percentages.concat(subjectiveAttainments?.subjective2[coNumber]);
            }
            percentages = percentages.filter(p => p !== null && p !== undefined);
            avgSubjectiveAttainments[coNumber] = percentages.length > 0 ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length : null;
        }
        //console.log("Avg Subjective Attainments: ", avgSubjectiveAttainments);
        const avgObjectiveAttainments = {};
        for (let i = 1; i <= numCOs; i++) {
            const coNumber = `${i-1}`;
            const percentages = [objectiveAttainments?.objective1?.[coNumber], objectiveAttainments?.objective2?.[coNumber]].filter(p => p !== null && p !== undefined);
            avgObjectiveAttainments[coNumber] = percentages.length > 0 ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length : null;
        }
        //console.log("Avg Objective Attainments: ", avgObjectiveAttainments);
        const avgEndExamAttainmentLevels = {};
        for (let i = 1; i <= numCOs; i++) {
            const coNumber = `${i-1}`;
            const levels = Object.values(endExamAttainments)
                .map(qAttainment => qAttainment[coNumber])
                .filter(level => level !== null && level !== undefined);
            avgEndExamAttainmentLevels[coNumber] = levels.length > 0 ? (levels.reduce((sum, l) => sum + l, 0) / levels.length) * 0.5 : null;
        }
        //console.log("Avg End Exam Attainment Levels: ", avgEndExamAttainmentLevels);
        // --- Calculating Overall Direct Attainment ---
        const overallDirectAttainments = {};
        for (let i = 1; i <= numCOs; i++) {
            const coNumber = `${i-1}`;
            const coNumber1 = `CO${i}`;
            const assignmentLOI = calculateLOI(avgAssignmentAttainments[coNumber]);
            const subjectiveLOI = calculateLOI(avgSubjectiveAttainments[coNumber1]);
            const objectiveLOI = calculateLOI(avgObjectiveAttainments[coNumber]);
            const presentationLOI = calculateLOI(presentationAttainment[coNumber]);
            const seeLevel = avgEndExamAttainmentLevels[coNumber];

            const directAttainment = (
                (assignmentLOI || 0) * 0.1 +
                (subjectiveLOI || 0) * 0.2 +
                (objectiveLOI || 0) * 0.1 +
                (presentationLOI || 0) * 0.1 +
                (seeLevel || 0) * 0.5
            );
            overallDirectAttainments[coNumber] = directAttainment;
        }

        // --- Calculating Indirect Attainments ---
        const overallIndirectAttainments = {};
        const tlpAverage = tlpSurveyData?.overallAverage || 0;
        const cesPercentages = {};
        courseEndSurveyData?.coPercentages.forEach(item => {
            cesPercentages[item.coNumber] = item.percentage;
        });

        for (let i = 1; i <= numCOs; i++) {
            const coNumber = `CO${i}`;
            const cesPercentage = cesPercentages[coNumber] || 0;
            overallIndirectAttainments[coNumber] = 0.5 * tlpAverage + 0.5 * cesPercentage;
        }

        // --- Calculating Overall Attainment ---
        const overallAttainments = {};
        for (let i = 1; i <= numCOs; i++) {
            const coNumber = `CO${i}`;
            const directAttainment = overallDirectAttainments[coNumber] || 0;
            const indirectAttainmentLOI = overallIndirectAttainments[coNumber] ? calculateLOI(overallIndirectAttainments[coNumber]) : 0;
            overallAttainments[coNumber] = 0.8 * directAttainment + 0.2 * indirectAttainmentLOI;
        }

        // --- Calculating PO Attainments ---
        const poAttainments = {};
        const poColumns = [];
        if (coPoMapping) {
            console.log("CO-PO Mapping: ", coPoMapping.mappings[0]);
            for (const key in coPoMapping.mappings[0]) {
                console.log("Key: ", key);
                if (key.length<=5 && (key.startsWith('po') || key.startsWith('pso'))) {
                    poColumns.push(key); // Initialize PO attainment
                }
            }
            console.log("PO Columns: ", poColumns);
            for (const po of poColumns) {
                let totalWeightedSum = 0;
                let totalMappingCount = 0;
                for (const coMapping of coPoMapping.mappings) {
                    const coNumberFromMapping = coMapping.coNumber;
                    const mappingValue = parseInt(coMapping[po]);
                    const overallAttainment = overallAttainments[coNumberFromMapping];
                    if (!isNaN(mappingValue) && overallAttainment !== undefined) {
                        totalWeightedSum += overallAttainment * mappingValue;
                        totalMappingCount++;
                    }
                }
                poAttainments[po] = totalMappingCount > 0 ? totalWeightedSum / totalMappingCount : 0;
            }
        }
        console.log("PO Attainments: ", poAttainments);
        const coList = [];
        const coList1 = [];
        for(let i=1;i<=numCOs;i++){
            coList.push(`CO${i}`);
        }
        for(let i=1;i<=numCOs;i++){
            coList1.push(`${i-1}`);
        }
        const result = {
            directAttainments: {
                assignment: Object.fromEntries(coList1.map((co) => [co, { percentage: avgAssignmentAttainments[co] ?? null, loi: calculateLOI(avgAssignmentAttainments[co]) ?? null}])),
                subjective: Object.fromEntries(coList.map((co) => [co, { percentage: avgSubjectiveAttainments[co] ?? null, loi: calculateLOI(avgSubjectiveAttainments[co]) ?? null}])),
                objective: Object.fromEntries(coList1.map((co) => [co, { percentage: avgObjectiveAttainments[co] ?? null, loi: calculateLOI(avgObjectiveAttainments[co]) ?? null}])),
                presentation: Object.fromEntries(coList.map((co)=>[co, {percentage: presentationAttainment[co] ?? null, loi: calculateLOI(presentationAttainment[co]) ?? null}])),
                seeLevel: Object.fromEntries(coList1.map((co) => [co, { level: avgEndExamAttainmentLevels[co] ?? null }])),
                overall: Object.fromEntries(coList1.map((co) => [co, { level: overallDirectAttainments[co] ?? null }])),
            },
            indirectAttainments: {
                tlp: { percentage: tlpAverage, loi: calculateLOI(tlpAverage) },
                ces: Object.fromEntries(coList.map((co) => [co, { percentage: cesPercentages[co] ?? null, loi: calculateLOI(cesPercentages[co]) ?? null}])),
                overall: Object.fromEntries(coList.map((co) => [co,  calculateLOI(overallIndirectAttainments[co]) ?? null])),
            },
            coAttainmentTable: coList1.map(co => ({
                coNumber: `CO${Number(co)+1}`,
                statement: coStatements[`CO${Number(co)+1}`] || '',
                directAttainment: overallDirectAttainments[co] ?? null,
                indirectAttainment: overallIndirectAttainments[`CO${Number(co)+1}`] ? calculateLOI(overallIndirectAttainments[`CO${Number(co)+1}`]) : null,
                overallAttainment: overallAttainments[`CO${Number(co)+1}`] ?? null,
            })),
            coPoMapping: coPoMapping?.mappings || [],
            coPoColumnAverages: coPoMapping?.columnAverages || {},
            poAttainments: poAttainments,
        };
        res.json(result);
    } catch (error) {
        console.error("Error fetching print attainment data:", error);
        res.status(500).json({ error: "Failed to fetch attainment data" });
    }
};