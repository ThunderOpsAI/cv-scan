"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Application,
  ApplicationStage,
  GeneratedEmail,
  ApplicationStatus,
  StageType,
  StageOutcome,
  EmailType,
} from "@/types/applications";

const STATUS_OPTIONS: { id: ApplicationStatus; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' },
];

const STAGE_TYPES: { id: StageType; label: string }[] = [
  { id: 'phone_screen', label: 'Phone Screen' },
  { id: 'technical', label: 'Technical' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'onsite', label: 'Onsite' },
  { id: 'final', label: 'Final Round' },
  { id: 'offer', label: 'Offer Discussion' },
  { id: 'other', label: 'Other' },
];

export default function ApplicationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [stages, setStages] = useState<ApplicationStage[]>([]);
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'emails' | 'notes'>('overview');
  const [showStageModal, setShowStageModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ApplicationStage | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && params.id) {
      fetchApplication();
    }
  }, [status, router, params.id]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/applications/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setApplication(data.application);
        setStages(data.stages || []);
        setEmails(data.emails || []);
      } else {
        router.push("/dashboard/applications");
      }
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (updates: Partial<Application>) => {
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
      }
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const deleteApplication = async () => {
    if (!confirm('Delete this application and all its data?')) return;
    try {
      await fetch(`/api/applications/${params.id}`, { method: 'DELETE' });
      router.push('/dashboard/applications');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (s: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      saved: 'bg-gray-500',
      applied: 'bg-blue-500',
      screening: 'bg-yellow-500',
      interviewing: 'bg-purple-500',
      offer: 'bg-green-500',
      rejected: 'bg-red-500',
      withdrawn: 'bg-gray-600',
    };
    return colors[s] || 'bg-gray-500';
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !application) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/applications" className="text-gray-300 hover:text-white">
            ← Back to Tracker
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-1">{application.company}</h1>
                <p className="text-xl text-gray-400 mb-4">{application.title}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={application.status}
                    onChange={(e) => updateApplication({ status: e.target.value as ApplicationStatus })}
                    className={`${getStatusColor(application.status)} text-white px-3 py-1 rounded-lg font-medium`}
                    data-testid="status-select"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  {application.location && (
                    <span className="text-gray-400">📍 {application.location}</span>
                  )}
                  {application.url && (
                    <a
                      href={application.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View Job ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {application.job_pack_id && (
                  <Link
                    href={`/dashboard/job-packs/${application.job_pack_id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    View Job Pack
                  </Link>
                )}
                <button
                  onClick={deleteApplication}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  data-testid="delete-app-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(['overview', 'stages', 'emails', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                data-testid={`tab-${tab}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Details</h3>
                    <div className="space-y-2 text-gray-300">
                      <p><span className="text-gray-500">Applied:</span> {formatDate(application.applied_at)}</p>
                      <p><span className="text-gray-500">Source:</span> {application.source || 'N/A'}</p>
                      <p><span className="text-gray-500">Priority:</span> <span className="capitalize">{application.priority}</span></p>
                      {application.ats_score && (
                        <p><span className="text-gray-500">ATS Score:</span> <span className="text-blue-400">{application.ats_score}%</span></p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Salary Range</h3>
                    {application.salary_range ? (
                      <p className="text-gray-300">
                        {application.salary_range.currency || '$'}
                        {application.salary_range.min?.toLocaleString()} - 
                        {application.salary_range.max?.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Interview Timeline</h3>
                  {stages.length > 0 ? (
                    <div className="space-y-3">
                      {stages.map((stage, i) => (
                        <div
                          key={stage.id}
                          className="flex items-center gap-4 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                          onClick={() => {
                            setSelectedStage(stage);
                            setShowStageModal(true);
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{stage.stage_name || STAGE_TYPES.find(t => t.id === stage.stage_type)?.label}</p>
                            <p className="text-gray-400 text-sm">{formatDate(stage.scheduled_at)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            stage.outcome === 'passed' ? 'bg-green-500/20 text-green-400' :
                            stage.outcome === 'failed' ? 'bg-red-500/20 text-red-400' :
                            stage.outcome === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {stage.outcome || 'pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No interviews scheduled yet</p>
                  )}
                  <button
                    onClick={() => {
                      setSelectedStage(null);
                      setShowStageModal(true);
                    }}
                    className="mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm"
                    data-testid="add-stage-btn"
                  >
                    + Add Interview Stage
                  </button>
                </div>
              </div>
            )}

            {/* Stages Tab */}
            {activeTab === 'stages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-semibold">Interview Stages</h3>
                  <button
                    onClick={() => {
                      setSelectedStage(null);
                      setShowStageModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Add Stage
                  </button>
                </div>
                {stages.length > 0 ? (
                  stages.map((stage) => (
                    <div
                      key={stage.id}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10"
                      onClick={() => {
                        setSelectedStage(stage);
                        setShowStageModal(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">
                            {stage.stage_name || STAGE_TYPES.find(t => t.id === stage.stage_type)?.label}
                          </h4>
                          <p className="text-gray-400 text-sm">{formatDate(stage.scheduled_at)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${
                          stage.outcome === 'passed' ? 'bg-green-500/20 text-green-400' :
                          stage.outcome === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {stage.outcome || 'pending'}
                        </span>
                      </div>
                      {stage.ai_structured && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-gray-400 text-sm mb-1">Key Points:</p>
                          <ul className="text-gray-300 text-sm space-y-1">
                            {stage.ai_structured.positive_signals?.slice(0, 2).map((s, i) => (
                              <li key={i} className="text-green-400">✓ {s}</li>
                            ))}
                            {stage.ai_structured.their_concerns?.slice(0, 2).map((c, i) => (
                              <li key={i} className="text-yellow-400">⚠ {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No stages added yet</p>
                )}
              </div>
            )}

            {/* Emails Tab */}
            {activeTab === 'emails' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-semibold">Generated Emails</h3>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    data-testid="generate-email-btn"
                  >
                    Generate Email (1cr)
                  </button>
                </div>
                {emails.length > 0 ? (
                  emails.map((email) => (
                    <div key={email.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-blue-400 text-sm capitalize">{email.email_type.replace('_', ' ')}</span>
                          <h4 className="text-white font-medium">{email.subject}</h4>
                        </div>
                        <span className="text-gray-500 text-sm">{formatDate(email.created_at)}</span>
                      </div>
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans mt-2">
                        {email.content}
                      </pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(email.content)}
                        className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Copy to clipboard
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No emails generated yet</p>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                <h3 className="text-white font-semibold mb-4">Notes</h3>
                <textarea
                  value={application.notes || ''}
                  onChange={(e) => updateApplication({ notes: e.target.value })}
                  rows={10}
                  placeholder="Add your notes about this application..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 resize-none"
                  data-testid="notes-textarea"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage Modal */}
      {showStageModal && (
        <StageModal
          applicationId={application.id}
          stage={selectedStage}
          onClose={() => {
            setShowStageModal(false);
            setSelectedStage(null);
          }}
          onSaved={() => {
            setShowStageModal(false);
            setSelectedStage(null);
            fetchApplication();
          }}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          applicationId={application.id}
          stages={stages}
          onClose={() => setShowEmailModal(false)}
          onGenerated={() => {
            setShowEmailModal(false);
            fetchApplication();
          }}
        />
      )}
    </div>
  );
}

// Stage Modal Component
function StageModal({
  applicationId,
  stage,
  onClose,
  onSaved,
}: {
  applicationId: string;
  stage: ApplicationStage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [stageType, setStageType] = useState<StageType>(stage?.stage_type || 'phone_screen');
  const [stageName, setStageName] = useState(stage?.stage_name || '');
  const [scheduledAt, setScheduledAt] = useState(stage?.scheduled_at?.slice(0, 16) || '');
  const [outcome, setOutcome] = useState<StageOutcome>(stage?.outcome as StageOutcome || 'pending');
  const [rawNotes, setRawNotes] = useState(stage?.raw_notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = stage
        ? `/api/applications/stages/${stage.id}`
        : '/api/applications/stages';
      const method = stage ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          stage_type: stageType,
          stage_name: stageName || undefined,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          outcome,
          raw_notes: rawNotes || undefined,
        }),
      });

      onSaved();
    } catch (err) {
      console.error('Failed to save stage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!stage || !confirm('Delete this stage?')) return;
    try {
      await fetch(`/api/applications/stages/${stage.id}`, { method: 'DELETE' });
      onSaved();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {stage ? 'Edit Stage' : 'Add Interview Stage'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Stage Type</label>
            <select
              value={stageType}
              onChange={(e) => setStageType(e.target.value as StageType)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              {STAGE_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-1">Custom Name (optional)</label>
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="e.g., Round 1 with Sarah"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Scheduled Date/Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as StageOutcome)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="pending">Pending</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-white mb-1">Interview Notes</label>
            <textarea
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              rows={6}
              placeholder="Brain dump your notes here... topics discussed, questions asked, your impressions..."
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white resize-none"
            />
            <p className="text-gray-500 text-xs mt-1">Notes will be automatically structured when saved</p>
          </div>

          <div className="flex gap-4 pt-4">
            {stage && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Email Modal Component
function EmailModal({
  applicationId,
  stages,
  onClose,
  onGenerated,
}: {
  applicationId: string;
  stages: ApplicationStage[];
  onClose: () => void;
  onGenerated: () => void;
}) {
  const [emailType, setEmailType] = useState<EmailType>('thank_you');
  const [stageId, setStageId] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          email_type: emailType,
          stage_id: stageId || undefined,
          context: context || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate email');
      }

      onGenerated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Generate Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white mb-1">Email Type</label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value as EmailType)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="thank_you">Thank You</option>
              <option value="follow_up">Follow Up</option>
              <option value="withdraw">Withdraw Application</option>
              <option value="accept">Accept Offer</option>
              <option value="decline">Decline Offer</option>
              <option value="negotiate">Negotiate Offer</option>
            </select>
          </div>

          {stages.length > 0 && (emailType === 'thank_you' || emailType === 'follow_up') && (
            <div>
              <label className="block text-white mb-1">Related Interview (optional)</label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              >
                <option value="">Select interview...</option>
                {stages.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.stage_name || s.stage_type}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-white mb-1">Additional Context (optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              placeholder="Any specific points to mention..."
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? 'Generating...' : 'Generate (1 credit)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
