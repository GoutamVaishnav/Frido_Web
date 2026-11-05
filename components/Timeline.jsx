import React from 'react';
import { Check, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { RETURN_STATUSES } from '@/lib/constants';

export function StatusTimeline({ currentStatus }) {
  const isRejected = currentStatus === RETURN_STATUSES.REJECTED;

  // Standard happy path steps
  const steps = [
    { key: RETURN_STATUSES.OPEN, label: 'Open', description: 'Request Submitted' },
    { key: RETURN_STATUSES.IN_REVIEW, label: 'In Review', description: 'Agent Triage' },
    { key: RETURN_STATUSES.APPROVED, label: 'Approved', description: 'Resolution Set' },
    { key: RETURN_STATUSES.COMPLETED, label: 'Completed', description: 'Fulfilled & Closed' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case RETURN_STATUSES.OPEN:
        return 0;
      case RETURN_STATUSES.IN_REVIEW:
        return 1;
      case RETURN_STATUSES.APPROVED:
        return 2;
      case RETURN_STATUSES.COMPLETED:
        return 3;
      case RETURN_STATUSES.REJECTED:
        return 1.5; // Branched from In Review
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Lifecycle Progress
          </h3>
          <p className="text-xs text-slate-500">
            Strict status transitions enforced per support policy
          </p>
        </div>
        {isRejected && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Rejected (Terminal State)
          </span>
        )}
      </div>

      <div className="relative">
        {/* Horizontal connector line */}
        <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
          <div
            className={`h-full transition-all duration-500 ${
              isRejected ? 'bg-rose-400' : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min(100, (currentIndex / (steps.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentStatus === step.key;
            const isPending = currentIndex < idx;

            let icon = <span className="text-xs font-semibold">{idx + 1}</span>;
            let bubbleStyle = 'bg-slate-100 text-slate-400 border-slate-200';
            let labelStyle = 'text-slate-400';

            if (isCompleted) {
              icon = <Check className="w-4 h-4 stroke-[2.5]" />;
              bubbleStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30';
              labelStyle = 'text-slate-900 font-semibold';
            } else if (isCurrent) {
              icon = <Clock className="w-4 h-4 animate-pulse" />;
              bubbleStyle =
                step.key === RETURN_STATUSES.APPROVED
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-500 ring-4 ring-emerald-50'
                  : 'bg-blue-50 text-blue-700 border-blue-500 ring-4 ring-blue-50';
              labelStyle = 'text-slate-900 font-semibold';
            }

            return (
              <div
                key={step.key}
                className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${bubbleStyle}`}
                >
                  {icon}
                </div>
                <div>
                  <div className={`text-xs font-medium ${labelStyle}`}>
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-400 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
