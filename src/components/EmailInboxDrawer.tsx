import React, { useState } from 'react';
import {
  X,
  Mail,
  CheckCircle,
  Inbox,
  Clock,
  ExternalLink,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.tsx';
import { EmailNotification } from '../types/index.ts';

export const EmailInboxDrawer: React.FC = () => {
  const {
    notifications,
    isInboxOpen,
    setIsInboxOpen,
    markAsRead,
    refreshNotifications,
    isLoading,
  } = useNotifications();

  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(
    notifications[0] || null
  );

  if (!isInboxOpen) return null;

  const handleSelectEmail = async (email: EmailNotification) => {
    setSelectedEmail(email);
    if (!email.read) {
      await markAsRead(email.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsInboxOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Customer Email Inbox Simulator
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                    Live Triggers
                  </span>
                </h2>
                <span className="text-xs text-slate-400">
                  Real automated notifications sent on checkout & shipment dispatch
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshNotifications}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsInboxOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Email Client Layout (Split View on larger screens, tabs on mobile) */}
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* Messages List (Left column) */}
            <div className="w-full sm:w-72 border-r border-slate-200 overflow-y-auto bg-slate-50/40 divide-y divide-slate-100 shrink-0">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span>No emails received yet. Place an order or update an order in Admin Portal to trigger emails!</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleSelectEmail(notif)}
                    className={`p-3.5 cursor-pointer text-xs transition-colors ${
                      selectedEmail?.id === notif.id
                        ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                        : notif.read
                        ? 'hover:bg-slate-100/60 opacity-80'
                        : 'bg-white font-bold hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono text-indigo-600 font-bold">{notif.orderNumber}</span>
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <h4 className="text-slate-900 font-semibold line-clamp-1 text-xs mb-1">
                      {notif.subject}
                    </h4>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                          notif.type === 'order_placed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : notif.type === 'order_shipped'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {notif.type.replace('_', ' ')}
                      </span>

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reading Pane (Right Column) */}
            <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col justify-between">
              {selectedEmail ? (
                <div>
                  {/* Email header metadata */}
                  <div className="border-b border-slate-200 pb-4 mb-4 space-y-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex flex-col text-xs text-slate-500 gap-0.5">
                      <div>
                        <strong className="text-slate-700">From:</strong> ApexStore Fulfillment &lt;orders@apexstore.com&gt;
                      </div>
                      <div>
                        <strong className="text-slate-700">To:</strong> {selectedEmail.toEmail}
                      </div>
                      <div>
                        <strong className="text-slate-700">Date:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Render simulated HTML body */}
                  <div
                    className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Select an email on the left to read its contents.
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                Automated Transactional Dispatch Simulator • Powered by Express REST Backend
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
