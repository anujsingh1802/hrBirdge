import { useMemo, useRef, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Button } from "../components/ui/button";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ApiError, uploadJobs } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function BulkUpload() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    message: string;
    total_inserted: number;
    skipped: number;
    errors?: Array<{ row: number | null; field: string; message: string }>;
  }>(null);
  const [error, setError] = useState("");

  const summary = useMemo(() => ({
    total: (result?.total_inserted || 0) + (result?.skipped || 0),
    valid: result?.total_inserted || 0,
    failed: result?.errors?.length || 0,
  }), [result]);

  const downloadTemplate = () => {
    const template = 'Job Title,Organization,Location,Job Type,Salary,Required Skills,Description\n' +
      'Senior Frontend Developer,Creative Pulse,"New York, NY",full-time,25-30 LPA,"react,typescript,tailwind",Apply expertise in React to build premium UI components.\n' +
      'Backend Specialist,DataStream Systems,Remote,contract,15-20 LPA,"node.js,mongodb,redis",Scale our microservices using modern Node.js patterns.\n';
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "job_portal_bulk_upload_template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!token || !file) {
      setError("Choose a CSV/XLSX file before uploading.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await uploadJobs(file, token);
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to upload jobs.");
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="admin" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Bulk Upload Jobs</h1>
              <p className="text-[var(--text-default)]">Upload multiple job postings at once using CSV or Excel</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-[1fr,360px] gap-6">
              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-8" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Upload File</h2>
                  <div className="block border-2 border-dashed border-[var(--border-soft)] p-12 text-center" style={{ borderRadius: "var(--radius-card)" }}>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
                    <p className="text-lg text-[var(--text-strong)] mb-2">Drag and drop your file here</p>
                    <p className="text-sm text-[var(--text-muted)] mb-4">or click to browse</p>
                    <Button type="button" variant="outline" onClick={openFilePicker}>Choose File</Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={(event) => setFile(event.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-4">Supported formats: CSV, XLSX</p>
                  </div>

                  {file && (
                    <div className="mt-4 rounded-xl bg-[var(--bg-base)] p-4 text-sm text-[var(--text-default)]">
                      Selected file: <span className="font-medium">{file.name}</span>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button type="button" variant="link" className="text-[var(--accent-500)] px-0" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Upload Results</h2>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-button)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-[var(--accent-500)]" />
                        <span className="text-sm text-[var(--text-muted)]">Total Rows</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-strong)]">{summary.total}</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-button)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-[var(--state-success)]" />
                        <span className="text-sm text-[var(--text-muted)]">Inserted</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--state-success)]">{summary.valid}</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-button)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-[var(--state-error)]" />
                        <span className="text-sm text-[var(--text-muted)]">Errors</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--state-error)]">{summary.failed}</p>
                    </div>
                  </div>

                  {result?.errors && result.errors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-[var(--text-strong)] mb-4">Errors</h3>
                      <div className="border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-button)" }}>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Row</TableHead>
                              <TableHead>Field</TableHead>
                              <TableHead>Message</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.errors.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.row ?? "-"}</TableCell>
                                <TableCell>{row.field}</TableCell>
                                <TableCell className="text-[var(--state-error)]">{row.message}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {result?.message && <p className="mt-4 text-sm text-[var(--text-default)]">{result.message}</p>}

                  <div className="flex gap-3 mt-6">
                    <Button className="flex-1 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white" onClick={handleUpload} disabled={submitting || !file}>
                      {submitting ? "Uploading..." : "Upload Jobs"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setFile(null);
                      setResult(null);
                      setError("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}>
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6 h-fit" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                <h3 className="font-semibold text-[var(--text-strong)] mb-4">Instructions</h3>
                <div className="space-y-4 text-sm text-[var(--text-default)]">
                  <div>
                    <h4 className="font-medium text-[var(--text-strong)] mb-2">1. Download Template</h4>
                    <p className="text-[var(--text-muted)]">Use the sample CSV so your columns match the backend parser.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text-strong)] mb-2">2. Fill in Data</h4>
                    <p className="text-[var(--text-muted)]">Required fields are `title` and `company`. Other fields are optional but recommended.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text-strong)] mb-2">3. Upload File</h4>
                    <p className="text-[var(--text-muted)]">The backend validates rows and returns inserted and skipped counts.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text-strong)] mb-2">4. Review Result</h4>
                    <p className="text-[var(--text-muted)]">If there are row-level errors, fix the file and upload again.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
