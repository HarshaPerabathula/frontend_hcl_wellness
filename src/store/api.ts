import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, WellnessGoal, DashboardData, PreventiveCare } from '../types';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:9000/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Goal', 'Patient', 'PreventiveCare', 'Dashboard'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<{ token: string; user: User }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<{ token: string; user: User }, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // User endpoints
    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<{ user: User }, any>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Patient endpoints
    getDashboard: builder.query<DashboardData, void>({
      query: () => '/patients/dashboard',
      providesTags: ['Dashboard'],
    }),
    getActiveGoals: builder.query<WellnessGoal[], void>({
      query: () => '/patients/active-goals',
      providesTags: ['Goal'],
    }),
    logProgress: builder.mutation<any, { goalId: string; date: string; actualValue: number }>({
      query: (data) => ({
        url: '/patients/log-progress',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Goal', 'Dashboard'],
    }),
    
    // Provider endpoints
    getPatients: builder.query<User[], void>({
      query: () => '/providers/patients',
      providesTags: ['Patient'],
    }),
    getAllPatients: builder.query<User[], void>({
      query: () => '/users/all-patients',
      providesTags: ['Patient'],
    }),
    assignPatient: builder.mutation<any, { patientId: string }>({
      query: (data) => ({
        url: '/providers/assign-patient',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Patient'],
    }),
    getPatientGoals: builder.query<WellnessGoal[], string>({
      query: (patientId) => `/providers/patients/${patientId}/goals`,
      providesTags: ['Goal'],
    }),
    assignGoal: builder.mutation<any, any>({
      query: (goalData) => ({
        url: '/providers/assign-goals',
        method: 'POST',
        body: goalData,
      }),
      invalidatesTags: ['Goal', 'Patient'],
    }),
    
    // Preventive Care endpoints
    getSchedule: builder.query<PreventiveCare[], void>({
      query: () => '/preventive-care/schedule',
      providesTags: ['PreventiveCare'],
    }),
    bookCheckup: builder.mutation<any, any>({
      query: (data) => ({
        url: '/preventive-care/book',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PreventiveCare', 'Dashboard'],
    }),
    markCompleted: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/preventive-care/${id}/complete`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['PreventiveCare'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetDashboardQuery,
  useGetActiveGoalsQuery,
  useLogProgressMutation,
  useGetPatientsQuery,
  useGetAllPatientsQuery,
  useAssignPatientMutation,
  useGetPatientGoalsQuery,
  useAssignGoalMutation,
  useGetScheduleQuery,
  useBookCheckupMutation,
  useMarkCompletedMutation,
} = api;