import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Editor from '@monaco-editor/react'
import ChatAi from "../component/ChatAI";
import SubmissionHistory from "../component/SubmissionHistory";
import Editorial from "../component/Editorial";



const langMap = {
    cpp:"C++",
    java:"Java",
    javascript:"JavaScript"
}



const ProblemPage = ()=>{
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [problem,setProblem] = useState(null)
    const [selectedLanguage,setSelectedLanguage] = useState('javascript')
    const [code,setCode] = useState('')
    const [loading,setLoading] = useState(false)
    const [runResult,setRunResult] = useState(null)
    const [submitResult,setSubmitResult] = useState(null)
    const [activeLeftTab,setActiveLeftTab] = useState('description')
    const [activeRightTab,setActiveRightTab] = useState('code')
    const [errorMessage, setErrorMessage] = useState(null)
    const editorRef = useRef(null)
    let {problemId}= useParams()

    useEffect(()=>{
        const fetchProblem = async () => {
            setLoading(true)
            try {
                const response = await axiosClient.get(`/problem/problemById/${problemId}`)
                const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage])?.initialCode
                setProblem(response.data)

                setCode(initialCode)
                setLoading(false)

            } catch (error) {
                console.error("Error fetching Problem",error)
                setLoading(false)
            }
        }
        fetchProblem()
    },[problemId])

    useEffect(()=>{
        if(problem){
            const initialCode = problem?.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode
            setCode(initialCode)
        }
    },[selectedLanguage,problem])

    useEffect(() => {
        if (isAuthenticated) {
            setErrorMessage(null);
        }
    }, [isAuthenticated])

    const handleRun = async () => {
        if (!isAuthenticated) {
            setErrorMessage("Please login to run your code");
            setActiveRightTab('testcase');
            return;
        }

        setLoading(true)
        setRunResult(null)
        setErrorMessage(null)

        try {
            const response = await axiosClient.post(`/submission/run/${problemId}`,{
                code,
                language : selectedLanguage
            })
            // console.log(response.data)
            setRunResult(response.data)
            setLoading(false)
            setActiveRightTab('testcase')
        } catch (error) {
            console.error("Error fetching Problmes:",error)
            let errorMsg = "Internal Server Error";
            
            if (error.response?.status === 401) {
                errorMsg = "Please login to run your code";
            } else if (error.response?.data) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : errorMsg;
            }
            
            setRunResult({
                success:false,
                error: errorMsg
            })
            setErrorMessage(errorMsg);
            setLoading(false)
            setActiveRightTab('testcase')
        }
    }

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            setErrorMessage("Please login to submit your code");
            setActiveRightTab('result');
            return;
        }

        setLoading(true)
        setSubmitResult(null)
        setErrorMessage(null)
        
        try {
            const response = await axiosClient.post(`/submission/submit/${problemId}`,{
                code:code,
                language:selectedLanguage
            })
            // console.log(response.data)
            setSubmitResult(response.data)
            setLoading(false)
            setActiveRightTab('result')
        } catch (error) {
            console.error("Error fetching problems:",error)
            let errorMsg = "Internal Server Error";
            
            if (error.response?.status === 401) {
                errorMsg = "Please login to submit your code";
            } else if (error.response?.data) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : errorMsg;
            }
            
            setSubmitResult({
                success:false,
                error: errorMsg
            })
            setErrorMessage(errorMsg);
            setLoading(false)
            setActiveRightTab('result')
        }
    }

    const getLanguageForMonaco = (lang)=>{
        switch (lang) {
            case 'javascript': return 'javascript'
            case 'java': return 'java'
            case 'cpp': return 'cpp'
            default: return 'javascript'
        }
    }

    const getDifficultColor = (difficulty)=>{
        switch (difficulty) {
            case 'easy':return 'text-green-500'
            case 'medium':return 'text-yellow-500'
            case 'hard':return 'text-red-500'
            default:return 'text-gray-500'
        }
    }

    const handleEditorChange = (value)=>{
        setCode(value || "")
    }
    
    const handleEditorDidMount = (editor)=>{
        editorRef.current = editor
    }

    const handleLanguageChange = (language)=>{
        setSelectedLanguage(language)
    }

    if(loading && !problem){
        return(
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }



    return(
        <div className="h-screen flex bg-base-100">
                 <div className="w-1/2 flex flex-col border-r border-base-300">
                <div className="tabs tabs-bordered bg-base-200 px-4">
                    <button className={`tab ${activeLeftTab==='description' ? 'tab-active':""}`}
                    onClick={()=>setActiveLeftTab('description')}
                    >
                        Description
                    </button>
                    <button className={`tab ${activeLeftTab==='editorial' ? 'tab-active':""}`}
                    onClick={()=>setActiveLeftTab('editorial')}
                    >
                        Editorial
                    </button>
                    <button className={`tab ${activeLeftTab==='solutions' ? 'tab-active':""}`}
                    onClick={()=>setActiveLeftTab('solutions')}
                    >
                        Solutions
                    </button>
                    <button className={`tab ${activeLeftTab==='submissions' ? 'tab-active':""}`}
                    onClick={()=>setActiveLeftTab('submissions')}
                    >
                        Submissions
                    </button>
                    <button className={`tab ${activeLeftTab==='ChatAI' ? 'tab-active':""}`}
                    onClick={()=>setActiveLeftTab('ChatAI')}
                    >
                        ChatAI
                    </button>


                </div>

                <div>
                    <div className="flex-1 overflow-y-auto-6">
                        {problem && (
                            <>
                            {activeLeftTab === 'description' && (
                                <div>
                                    <div className="flex items-center gap-6 mb-6 pt-2">
                                        <h1 className="text-2xl font-bold pl-2">{problem.title}</h1>
                                        <div className={`badge badge-outline ${getDifficultColor(problem.difficulty)}`}>
                                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                        </div>
                                        <div className="badge badge-primary">{problem.tags}</div>
                                    </div>

                                    <div className="prose max-w-none">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed pl-2">
                                            {problem.description}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold mb-2 pl-2">Examples:</h3>
                                        <div className="space-y-4">
                                            {problem.visibleTestCases.map((example,index)=>(
                                                <div key={index} className="bg-base-200 p-4 rounded-lg">
                                                    <h4 className="font-semibold mb-2">Example {index+1}</h4>
                                                    <div className="space-y-2 text-sm font-mono">
                                                    <div><strong>Input:</strong>{example.input}</div>
                                                    <div><strong>Output:</strong>{example.output}</div>
                                                    <div><strong>Explaination:</strong>{example.explanation}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'editorial' && (
                                <div className="prose max-w-none">
                                    <h2 className="text-xl font-bold mb-4">Editorial</h2>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'solutions' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Solutions</h2>
                                    <div className="space-y-6">
                                        {problem.referenceSolution?.map((solution,index)=>(
                                            <div key={index} className="border border-base-300 rounded-lg">
                                                <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                                                    <h3 className="font-semibold">{problem?.title}-{solution?.language}</h3>
                                                </div>
                                                <div className="p-4">
                                                    <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto"> 
                                                        <code>{solution?.completeCode}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        )) || <p className="text-gray-500">Solution will be awailable after you solve the problem</p>}
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'submissions' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                                    <div className="text-gray-500">
                                        <SubmissionHistory problemId={problemId}/>
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'ChatAI' && (
                                <div className="prose max-w-none">
                                    <h2 className="text-xl font-bold mb-4">CHAT WITH AI</h2>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        <ChatAi problem={problem}/>
                                    </div>
                                </div>
                            )}
                            </>
                        )}
                    </div>
                </div>
                </div>


                <div className="w-1/2 flex flex-col">
                    <div className="tabs tabs-bordered bg-base-200 px-4">
                        <button
                        className={`tab ${activeRightTab === 'code'?'tab-active':''}`}
                        onClick={()=>setActiveRightTab('code')}
                        >
                            Code
                        </button>
                        <button
                        className={`tab ${activeRightTab === 'testcase'?'tab-active':''}`}
                        onClick={()=>setActiveRightTab('testcase')}
                        >
                            TestCase
                        </button>
                        <button
                        className={`tab ${activeRightTab === 'result'?'tab-active':''}`}
                        onClick={()=>setActiveRightTab('result')}
                        >
                            Result
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {activeRightTab === 'code' && (
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-center p-4 border-b border-base-300">
                                    <div className="flex gap-2">
                                        {['javascript','java','cpp'].map((lang)=>(
                                            <button
                                            key={lang}
                                            className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary':'btn-ghost'}`}
                                            onClick={()=>handleLanguageChange(lang)}
                                            >
                                                {lang ==='cpp' ? "C++":lang === 'javascript' ? 'JavaScript' : 'Java' }
                                            </button>
                                        ))}
                                    </div>
                                </div>


                                <div className="flex-1">
                                    <Editor
                                    height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                                        }
                                    }
                                    />
                                </div>


                                <div className="p-4 border-t border-base-300 flex justify-between">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {errorMessage && !runResult && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold">Error</h4>
                    <p>{errorMessage}</p>
                    <div className="mt-2">
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                        Go to Login
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {runResult ? (
                <div className={`alert ${runResult?.success ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>
                        <p className="text-sm mt-2">Runtime: {runResult.runtime+" sec"}</p>
                        <p className="text-sm">Memory: {runResult.memory+" KB"}</p>
                        
                        <div className="mt-4 space-y-2">
                          {runResult?.testCases?.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={'text-green-600'}>
                                  {'✓ Passed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold">❌ Error</h4>
                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={tc.status_id==3 ? 'text-green-600' : 'text-red-600'}>
                                  {tc.status_id==3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {errorMessage && !submitResult && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold">Error</h4>
                    <p>{errorMessage}</p>
                    <div className="mt-2">
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                        Go to Login
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {submitResult ? (
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult?.passedtestCases}/{submitResult?.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + "KB"} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">❌ {submitResult.error}</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                            
        </div>
    )
    
    
    
}


export default ProblemPage;
