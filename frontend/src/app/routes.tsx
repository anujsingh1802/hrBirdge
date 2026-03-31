import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RequireAdmin, RequireUser } from "./components/RouteGuards";

// Lazy-load every page so each becomes its own JS chunk (code splitting)
const Home             = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const JobListing       = lazy(() => import("./pages/JobListing").then(m => ({ default: m.JobListing })));
const JobDetail        = lazy(() => import("./pages/JobDetail").then(m => ({ default: m.JobDetail })));
const Login            = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register         = lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard").then(m => ({ default: m.CandidateDashboard })));
const MyApplications   = lazy(() => import("./pages/MyApplications").then(m => ({ default: m.MyApplications })));
const Profile          = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const ApplyFlow        = lazy(() => import("./pages/ApplyFlow").then(m => ({ default: m.ApplyFlow })));
const AdminDashboard   = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ManageJobs       = lazy(() => import("./pages/ManageJobs").then(m => ({ default: m.ManageJobs })));
const CreateEditJob    = lazy(() => import("./pages/CreateEditJob").then(m => ({ default: m.CreateEditJob })));
const BulkUpload       = lazy(() => import("./pages/BulkUpload").then(m => ({ default: m.BulkUpload })));
const Applicants       = lazy(() => import("./pages/Applicants").then(m => ({ default: m.Applicants })));
const NotFound         = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));
const Companies        = lazy(() => import("./pages/Companies").then(m => ({ default: m.Companies })));
const PlaceholderPage  = lazy(() => import("./pages/PlaceholderPage").then(m => ({ default: m.PlaceholderPage })));

// Wrap lazy components so Suspense is always present
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "1rem", color: "#888" }}>Loading…</div>}>
    {children}
  </Suspense>
);

function CandidateDashboardRoute() {
  return (
    <S><RequireUser><CandidateDashboard /></RequireUser></S>
  );
}

function MyApplicationsRoute() {
  return (
    <S><RequireUser><MyApplications /></RequireUser></S>
  );
}

function ProfileRoute() {
  return (
    <S><RequireUser><Profile /></RequireUser></S>
  );
}

function ApplyRoute() {
  return (
    <S><RequireUser><ApplyFlow /></RequireUser></S>
  );
}

function AdminDashboardRoute() {
  return (
    <S><RequireAdmin><AdminDashboard /></RequireAdmin></S>
  );
}

function ManageJobsRoute() {
  return (
    <S><RequireAdmin><ManageJobs /></RequireAdmin></S>
  );
}

function CreateEditJobRoute() {
  return (
    <S><RequireAdmin><CreateEditJob /></RequireAdmin></S>
  );
}

function BulkUploadRoute() {
  return (
    <S><RequireAdmin><BulkUpload /></RequireAdmin></S>
  );
}

function ApplicantsRoute() {
  return (
    <S><RequireAdmin><Applicants /></RequireAdmin></S>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <S><Home /></S>,
  },
  {
    path: "/jobs",
    element: <S><JobListing /></S>,
  },
  {
    path: "/companies",
    element: <S><Companies /></S>,
  },
  {
    path: "/services/*",
    element: <S><PlaceholderPage /></S>,
  },
  {
    path: "/employer/*",
    element: <S><PlaceholderPage /></S>,
  },
  {
    path: "/jobs/:id",
    element: <S><JobDetail /></S>,
  },
  {
    path: "/login",
    element: <S><Login /></S>,
  },
  {
    path: "/register",
    element: <S><Register /></S>,
  },
  {
    path: "/dashboard",
    element: <CandidateDashboardRoute />,
  },
  {
    path: "/my-applications",
    element: <MyApplicationsRoute />,
  },
  {
    path: "/profile",
    element: <ProfileRoute />,
  },
  {
    path: "/apply/:id",
    element: <ApplyRoute />,
  },
  {
    path: "/admin",
    element: <AdminDashboardRoute />,
  },
  {
    path: "/admin/jobs",
    element: <ManageJobsRoute />,
  },
  {
    path: "/admin/jobs/create",
    element: <CreateEditJobRoute />,
  },
  {
    path: "/admin/jobs/:id/edit",
    element: <CreateEditJobRoute />,
  },
  {
    path: "/admin/bulk-upload",
    element: <BulkUploadRoute />,
  },
  {
    path: "/home",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/admin/dashboard",
    element: <Navigate to="/admin" replace />,
  },
  {
    path: "/admin/applicants",
    element: <ApplicantsRoute />,
  },
  {
    path: "*",
    element: <S><NotFound /></S>,
  },
]);
