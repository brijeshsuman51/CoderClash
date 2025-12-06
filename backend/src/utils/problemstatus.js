const { getLanguageById, submitBatch, submitToken } = require("./problemvalid");

// Problem Status  

const problemStatus = async (data) => {
    const {
        visibleTestCases = [],
        referenceSolution
    } = data;

    if (!Array.isArray(referenceSolution)) {
        throw new Error("Reference solution is missing or not in the correct format.");
    }

    for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageById(language);

        const submissions = visibleTestCases.map((testcase) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        if (submissions.length === 0) {
            console.warn(`[WARN] No visible test cases to submit for language: ${language}. Skipping.`);
            continue; 
        }
        
        const submitResult = await submitBatch(submissions);


        if (!Array.isArray(submitResult)) {
            console.error("submitBatch did not return an array:", submitResult);
            throw new Error("Failed to get a valid result from the submission batch. Check the server logs for the raw result from the API.");
        }

        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);
        // console.log(testResult);

        for (const test of testResult) {
            const statusDescription = test.status ? test.status.description : 'Unknown Status';
            if (test.status_id !== 3) {
                throw new Error(
                    `Reference solution for ${language} failed validation. Expected: '${test.expected_output}', Got: '${test.stdout || 'nothing'}'. Status: ${statusDescription}`
                );
            }
        }
    }
};

module.exports = problemStatus;