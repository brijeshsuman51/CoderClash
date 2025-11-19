import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// fetching all problems
export const fetchAllProblems = createAsyncThunk(
  'problems/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/problem/getAllProblem');
      // Handle case where backend returns string "Problems is Missing"
      if (typeof response.data === 'string') {
        return [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      let errorMessage = 'Failed to fetch problems';
      
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// fetching solved problems by user
export const fetchSolvedProblems = createAsyncThunk(
  'problems/fetchSolved',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/problem/problemSolvedByUser');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      let errorMessage = 'Failed to fetch solved problems';
      
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue({ message: errorMessage });
    }
  }
);

const problemsSlice = createSlice({
  name: 'problems',
  initialState: {
    problems: [],
    solvedProblems: [],
    loading: false,
    solvedLoading: false,
    error: null,
    solvedError: null
  },
  reducers: {
    clearProblems: (state) => {
      state.problems = [];
      state.solvedProblems = [];
      state.error = null;
      state.solvedError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Problems Cases
      .addCase(fetchAllProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload;
        state.error = null;
      })
      .addCase(fetchAllProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch problems';
        state.problems = [];
      })
      
      // Fetch Solved Problems Cases
      .addCase(fetchSolvedProblems.pending, (state) => {
        state.solvedLoading = true;
        state.solvedError = null;
      })
      .addCase(fetchSolvedProblems.fulfilled, (state, action) => {
        state.solvedLoading = false;
        state.solvedProblems = action.payload;
        state.solvedError = null;
      })
      .addCase(fetchSolvedProblems.rejected, (state, action) => {
        state.solvedLoading = false;
        state.solvedError = action.payload?.message || 'Failed to fetch solved problems';
        state.solvedProblems = [];
      });
  }
});

export const { clearProblems } = problemsSlice.actions;
export default problemsSlice.reducer;

