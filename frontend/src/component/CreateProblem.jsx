import { zodResolver } from "@hookform/resolvers/zod"
import { languages } from "monaco-editor"
import { useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { useSelector } from "react-redux"
import { z } from 'zod'
import axiosClient from "../utils/axiosClient"


const problemSchema = z.object({
    title:z.string().min(1,"Title is required"),
    description:z.string().min(1,"Description is required"),
    difficulty:z.enum(['easy','medium','hard']),
    tags:z.enum(['array','linkedList','string','graph']),
    visibleTestCases:z.array(
        z.object({
            input:z.string().min(1,"Input is required"),
            output:z.string().min(1,"Output is required"),
            explanation:z.string().min(1,"Explanation is required")
        })
    ).min(1,"Minimum one visible test cases is required"),
    hiddenTestCases:z.array(
        z.object({
            input:z.string().min(1,"Input is required"),
            output:z.string().min(1,"Output is required"),
        })
    ).min(1,"Minimum one hidden test cases is required"),
    startCode:z.array(
        z.object({
            language:z.enum(['C++','Java',"JavaScript"]),
            initialCode:z.string().min(1,"Initial code is required")
        })
    ).length(3,"All three languages required"),
    referenceSolution:z.array(
        z.object({
            language:z.enum(["C++","Java","JavaScript"]),
            completeCode:z.string().min(1,"Complete Code is required")
        })
    ).length(3,"All three languages required")
})  


function CreateProblem(){
    const navigate = useNavigate()
    const { isGuestMode } = useSelector((state) => state.auth)
    const {
        register,
        control,
        handleSubmit,
        formState:{errors}
    }=useForm({
        resolver:zodResolver(problemSchema),
        defaultValues:{
            startCode:[
                {language:"C++",initialCode:""},
                {language:"Java",initialCode:""},
                {language:"JavaScript",initialCode:""},

            ],
            referenceSolution:[
                {language:"C++",completeCode:""},
                {language:"Java",completeCode:""},
                {language:"JavaScript",completeCode:""}
            ]
        }
    })

    const {
        fields:visibleFields,
        append:appendVisible,
        remove:removeVisible
    } = useFieldArray({
        control,
        name:'visibleTestCases'
})

    const {
        fields:hiddenFields,
        append:appendHidden,
        remove:removeHidden
    } = useFieldArray({
        control,
        name:'hiddenTestCases'
    })


    const onSubmit = async (data)=>{
        console.log(data)
        try {
            await axiosClient.post('/problem/create',data)
            alert("Problem created Successfully!")
            navigate("/")
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`)
        }
    }

    return(
        <div className="container max-auto p-6">
            <h1 className="text-3xl font-bold mb-6 ">Create New Problem</h1>

            {isGuestMode && (
                <div className="alert alert-warning mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 4v2M7.08 6.06A9 9 0 1 0 21 12a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5 6 6 0 1 1-6-6 .5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5A9 9 0 0 0 7.08 6.06z" />
                    </svg>
                    <span>You are in Guest Mode. You can view admin features but cannot create problems. Please log in to create problems.</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                            <span className="label-text">Title</span>
                            </label>
                            <input
                            {...register('title')}
                            className={`input input-bordered ${errors.title && 'input-error'}`}
                            />
                            {errors.title && (
                                <span className="text-error">{errors.title.message}</span>
                            )}
                        </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <textarea
                            {...register('description')}
                            className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`}
                        />
                        {errors.description && (
                            <span className="text-error">{errors.description.message}</span>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="form-control w-1/2">
                        <label className="label">
                        <span className="label-text">Difficulty</span>
                        </label>
                        <select
                        {...register('difficulty')}
                        className={`select selected-bordered ${errors.difficulty && 'select-error'}`}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                        </div>

                        <div className="form-control w-1/2">
                        <label className="label">
                        <span className="label-text">Tags</span>
                        </label>
                        <select
                        {...register('tags')}
                        className={`select selected-bordered ${errors.tags && 'select-error'}`}
                        >
                            <option value="array">Array</option>
                            <option value="string">String</option>
                            <option value="linkedList">LinkedList</option>
                            <option value="graph">Graph</option>
                        </select>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Visible Test Cases</h3>
                            <button
                            type="button"
                            onClick={()=>appendVisible({input:"",output:"",explanation:'' })}
                            className="btn btn-sm btn-primary"
                            >
                                Add Visible Case
                            </button>
                        </div>

                        {visibleFields.map((field,index)=>(
                            <div key={field.id} className="border p-4 rounded-lg space-y-2">
                                <div className="flex justify-end">
                                    <button
                                    type="button"
                                    onClick={()=>removeVisible(index)}
                                    className="btn btn-xs btn-error"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <input
                                {...register(`visibleTestCases.${index}.input`)}
                                placeholder="Input"
                                className="input input-bordered w-full"
                                />
                                <input
                                {...register(`visibleTestCases.${index}.output`)}
                                placeholder="Output"
                                className="input input-bordered w-full"
                                />

                                <textarea
                                {...register(`visibleTestCases.${index}.explanation`)}
                                placeholder="Explanation"
                                className="textarea textarea-bordered w-full"
                                />
                            </div>
                        ))}
                    </div>

                        <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Hidden Test Cases</h3>
                            <button
                            type="button"
                            onClick={()=>appendHidden({input:"",output:"" })}
                            className="btn btn-sm btn-primary"
                            >
                                Add hidden Case
                            </button>
                        </div>

                        {hiddenFields.map((fields,index)=>(
                            <div key={fields.id} className="border p-4 rounded-lg space-y-2">
                                <div className="flex justify-end">
                                    <button
                                    type="button"
                                    onClick={()=>removeHidden(index)}
                                    className="btn btn-xs btn-error"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <input
                                {...register(`hiddenTestCases.${index}.input`)}
                                placeholder="Input"
                                className="input input-bordered w-full"
                                />
                                <input
                                {...register(`hiddenTestCases.${index}.output`)}
                                placeholder="Output"
                                className="input input-bordered w-full"
                                />

                                
                            </div>
                        ))}
                    </div>

                </div>

                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Code Templates</h2>

                    <div className="space-y-6">
                        {[0,1,2].map((index)=> (
                            <div key={index} className="space-y-2">
                                <h3 className="font-mono">
                                    {index === 0 ? 'C++' : index===1 ? "Java" : "JavaScript"}
                                </h3>

                                <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Initial Code</span>
                                </label>

                                <pre className="bg-base-300 p-4 rounded-lg">
                                    <textarea
                                    {...register(`startCode.${index}.initialCode`)}
                                    className="w-full bg-transparent font-mono"
                                    rows={6}
                                    />
                                </pre>  
                                </div>
                                <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Complete Code</span>
                                </label>

                                <pre className="bg-base-300 p-4 rounded-lg">
                                    <textarea
                                    {...register(`referenceSolution.${index}.completeCode`)}
                                    className="w-full bg-transparent font-mono"
                                    rows={6}
                                    />
                                </pre>  
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary w-full" 
                    disabled={isGuestMode}
                >
                    {isGuestMode ? 'Disabled in Guest Mode' : 'Create Problem'}
                </button>
            </form>
        </div>
    )
}

export default CreateProblem