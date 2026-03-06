import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import axiosClient from "../utils/axiosClient"
import { NavLink } from "react-router"

const DeleteVideo = ()=>{
    const isGuestMode = useSelector(state=>state.auth.isGuestMode)
    const [problems,setProblems] = useState([])
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null)

    useEffect(()=>{
        fetchProblems()
    },[])

    const fetchProblems = async () => {
        try {
            setLoading(true)
            const {data} = await axiosClient.get("/problem/getAllProblem")
            setProblems( data )
        } catch (err) {
           setError('Failed to fetch video')
           console.error(err)
        }finally{
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if(!window.confirm('Are you sure to delete this problem?')) return;

        try {
            await axiosClient.delete(`/video/delete/${id}`)
            setProblems(problems.filter(problem => problem._id !== id))
        } catch (error) {
            setError('Failed to delete Problem')
            console.error(err)
        }
    }

    if(loading){
        return(
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if(isGuestMode){
      return (
          <div className="container mx-auto p-4">
              <div className="alert alert-warning shadow-lg mb-6">
                  <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 4v2M7.08 6.06A9 9 0 1 0 21 12a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5 6 6 0 1 1-6-6 .5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5A9 9 0 0 0 7.08 6.06z" />
                      </svg>
                      <span>Guest Mode active. Upload/delete disabled.</span>
                  </div>
              </div>
          </div>
      )
  }

  return(
    <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Upload And Delete Solutions</h1>
        </div>

        <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
                <thead>
                    <tr>
                        <th className="w-1/12">#</th>
                        <th className="w-4/12">Title</th>
                        <th className="w-2/12">Difficulty</th>
                        <th className="w-3/12">Tags</th>
                        <th className="w-2/12">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {problems.map((problem,index)=>(
                        <tr key={problem._id}>
                            <th>{index+1}</th>
                            <td>{problem.title}</td>
                            <td>
                                <span className={`badge ${
                                    problem.difficulty === 'Easy' 
                                    ? 'badge-success' 
                                    : problem.difficulty === 'Medium'
                                    ? 'badge-warning' : 'badge-error'
                                 }`}>
                                    {problem.difficulty}
                                </span>
                            </td>
                            <td>
                                <span className="badge badge-outline">{problem.tags}</span>
                            </td>
                            <td>
                                <div className="flex space-x-1">
                                 {isGuestMode ? (
                                    <button className="btn bg-blue-600 btn-disabled" disabled title="Disabled in guest mode">
                                        Upload
                                    </button>
                                 ) : (
                                    <NavLink
                                     to={`/admin/upload/${problem._id}`}
                                     className={`btn bg-blue-600`}
                                     >
                                        Upload
                                    </NavLink>
                                 )}
                                </div>
                            </td>
                            <td>
                                <div className="flex space-x-2">
                                 <button
                                 onClick={()=>handleDelete(problem._id)}
                                 className="btn btn-sm btn-error"
                                 disabled={isGuestMode}
                                 >
                                    {isGuestMode ? 'Disabled' : 'Delete'}
                                 </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default DeleteVideo