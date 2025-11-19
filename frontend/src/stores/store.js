import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice';
import problemsReducer from '../problemsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    problems: problemsReducer
  }
});


