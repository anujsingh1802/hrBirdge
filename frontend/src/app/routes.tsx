import { createBrowserRouter, Navigate } from "react-router";
import { Home } from "./pages/Home";
import { JobListing } from "./pages/JobListing";
import { JobDetail } from "./pages/JobDetail";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { CandidateDashboard } from "./pages/CandidateDashboard";
import { MyApplications } from "./pages/MyApplications";
import { Profile } from "./pages/Profile";
import { ApplyFlow } from "./pages/ApplyFlow";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ManageJobs } from "./pages/ManageJobs";
import { CreateEditJob } from "./pages/CreateEditJob";
import { BulkUpload } from "./pages/BulkUpload";
import { Applicants } from "./pages/Applicants";
import { NotFound } from "./pages/NotFound";
import { RequireAdmin, RequireUser } from "./components/RouteGuards";

function CandidateDashboardRoute() {
  return (
    <RequireUser>
      <CandidateDashboard />
    </RequireUser>
  );
}

function MyApplicationsRoute() {
  return (
    <RequireUser>
      <MyApplications />
    </RequireUser>
  );
}

function ProfileRoute() {
  return (
    <RequireUser>
      <Profile />
    </RequireUser>
  );
}

function ApplyRoute() {
  return (
    <RequireUser>
      <ApplyFlow />
    </RequireUser>
  );
}

function AdminDashboardRoute() {
  return (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  );
}

function ManageJobsRoute() {
  return (
    <RequireAdmin>
      <ManageJobs />
    </RequireAdmin>
  );
}

function CreateEditJobRoute() {
  return (
    <RequireAdmin>
      <CreateEditJob />
    </RequireAdmin>
  );
}

function BulkUploadRoute() {
  return (
    <RequireAdmin>
      <BulkUpload />
    </RequireAdmin>
  );
}

function ApplicantsRoute() {
  return (
    <RequireAdmin>
      <Applicants />
    </RequireAdmin>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/jobs",
    Component: JobListing,
  },
  {
    path: "/jobs/:id",
    Component: JobDetail,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/dashboard",
    Component: CandidateDashboardRoute,
  },
  {
    path: "/my-applications",
    Component: MyApplicationsRoute,
  },
  {
    path: "/profile",
    Component: ProfileRoute,
  },
  {
    path: "/apply/:id",
    Component: ApplyRoute,
  },
  {
    path: "/admin",
    Component: AdminDashboardRoute,
  },
  {
    path: "/admin/jobs",
    Component: ManageJobsRoute,
  },
  {
    path: "/admin/jobs/create",
    Component: CreateEditJobRoute,
  },
  {
    path: "/admin/jobs/:id/edit",
    Component: CreateEditJobRoute,
  },
  {
    path: "/admin/bulk-upload",
    Component: BulkUploadRoute,
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
    Component: ApplicantsRoute,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
