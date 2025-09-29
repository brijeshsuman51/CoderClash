const Problem = require('../models/problem')
const User = require('../models/user')
const Submit = require('../models/submit')
const {getLanguageById,submitBatch,submitToken} = require('../utils/problemvalid')

const submitCode = async (req,res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        let { code,language } = req.body;

        if(!userId || !problemId || !code || !language){
            return res.send('Some Fields Missing')
        }

        if(language==='cpp')
            language = 'c++'

        const problem = await Problem.findById(problemId)

        const submittedResult = await Submit.create({
            userId,
            problemId,
            code,
            language,
            status:'pending',
            testCasesTotal:problem.hiddenTestCases.length
        })

        const languageId = getLanguageById(language)

        const submissions = problem.hiddenTestCases.map((testcase)=>({
            source_code:code,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }))

        const submitResult = await submitBatch(submissions)

        const resultToken = submitResult.map((value)=>value.token)
        
        const testResult = await submitToken(resultToken)

        let testCasesPassed = 0;
        let memory =0;
        let runtime=0;
        let status='accepted'
        let errorMessage = null;


        for(const test of testResult){
            if(test.status_id==3){
                testCasesPassed++;
                runtime = runtime+parseFloat(test.time)
                memory = Math.max(memory,test.memory)
            }
            else{
                if(test.status_id==4){
                    status = 'error'
                    errorMessage = test.stderr
                }
                else{
                    status = 'wrong'
                    errorMessage = test.stderr
                }
            }
        }

        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed
        submittedResult.runtime = runtime
        submittedResult.memory = memory
        submittedResult.errorMessage = errorMessage;

        await submittedResult.save()

        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId)
            await req.result.save()
        }
        // console.log(submittedResult)
        const accepted = (status == 'accepted')
        res.json({
            accepted,
            totalTestCases:submittedResult.testCasesTotal,
            passedtestCases:testCasesPassed,
            runtime,
            memory
        })
        
    } catch (error) {
        res.send("Error:"+error)
    }
}

const runCode = async (req,res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        let {code,language} = req.body;

        if(!userId || !problemId || !code || !language){
            res.send("Some Fields Missing")
        }

        const problem = await Problem.findById(problemId)
        // console.log(problem)
        
        if(language==='cpp'){
            language = 'c++'
        }
        // console.log("Hello")
        
        const languageId = getLanguageById(language)

        const submissions = problem.visibleTestCases.map((testcase)=>({
            source_code:code,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }))

        const submitResult = await submitBatch(submissions)

        const resultToken = submitResult.map((value)=>value.token)

        const testResult = await submitToken(resultToken)

        let testCasesPassed =0;
        let runtime =0;
        let memory =0;
        let status=true;
        let errorMessage=null
        
        for(const test of testResult){
            if(test.status_id==3){
                testCasesPassed++
                runtime = runtime+parseFloat(test.time)
                memory = Math.max(memory,test.memory)
            }else{
                if(test.status_id==4){
                    status=false
                    errorMessage=test.stderr
                }
                else{
                    status = false
                    errorMessage = test.stderr
                }
            }
        }
        res.json({
            success:status,
            testCases:testResult,
            runtime,
            memory
        })
    } catch (error) {
        res.send("Error2:",error.message)
    }
}






module.exports = {submitCode,runCode} 