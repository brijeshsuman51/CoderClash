import { Routes,Route,Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useDispatch,useSelector } from "react-redux";
import Homepage from "./pages/HomePage";
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import CreateProblem from "./component/CreateProblem";
import UpdateProblem from "./component/UpdateProblem";
import DeleteProblem from "./component/DeleteProblem";
import DeleteVideo from "./component/UploadAndDeleteVideo";
import CloudinaryUploadVideo from "./component/CloudinaryVideo";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";


function App(){
    const dispatch = useDispatch()
    const {isAuthenticated,user,loading,isGuestMode} = useSelector((state)=>state.auth)

    useEffect(()=>{
        dispatch(checkAuth())
        // restore guest mode from localStorage
        try {
            const stored = localStorage.getItem('guestMode');
            if (stored === 'true') {
                dispatch({ type: 'auth/setGuestMode', payload: true });
            }
        } catch {};
    },[dispatch])

    // persist guest mode changes
    useEffect(() => {
        try {
            localStorage.setItem('guestMode', isGuestMode ? 'true' : 'false');
        } catch {};
    }, [isGuestMode]);

    if(loading){
        return <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    }

    return(
        <>
        <Routes>
            <Route path="/" element={<Homepage></Homepage>}></Route>
            <Route path="/login" element={isAuthenticated ? <Navigate to='/'/> : <Login></Login> }></Route>
            <Route path="/signup" element={isAuthenticated ? <Navigate to='/'/> : <Signup></Signup> }></Route>
            <Route path="/admin" element={(isAuthenticated && user?.role==='admin') || isGuestMode ? <AdminPanel/> : <Navigate to="/" /> }></Route>
            <Route path="/admin/create" element={(isAuthenticated && user?.role === 'admin') || isGuestMode ? <CreateProblem /> : <Navigate to="/" />} />
            <Route path="/admin/update" element={(isAuthenticated && user?.role === 'admin') || isGuestMode ? <UpdateProblem /> : <Navigate to="/" />} />
            <Route path="/admin/update/:problemId" element={(isAuthenticated && user?.role === 'admin') || isGuestMode ? <UpdateProblem /> : <Navigate to="/" />} />
            <Route path="/admin/delete" element={(isAuthenticated && user?.role === 'admin') || isGuestMode ? <DeleteProblem /> : <Navigate to="/" />} />
            <Route path="/admin/video" element={(isAuthenticated && user?.role === 'admin') || isGuestMode ? <DeleteVideo /> : <Navigate to="/" />} />
            <Route path="/admin/upload/:problemId" element={(isAuthenticated && user?.role === 'admin') || isGuestMode ? <CloudinaryUploadVideo /> : <Navigate to="/" />} />
            <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}></Route>
            <Route path="/profile/edit" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />}></Route>
        </Routes>
        </>
    )
}

export default App;