import {
  CheckCircle2,
  DollarSign,
  Send,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type {
  Deal,
  DealMessage,
  EscrowStatus,
  UserProfile,
} from '../types/marketplace';
import {
  ESCROW_STEPS,
  formatCurrency,
  getNextEscrowStatus,
} from '../utils/marketplaceLogic';

interface DealRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  activeDealId: string | null;
  onSelectDeal: (dealId: string) => void;
  messages: DealMessage[];
  currentUser: UserProfile;
  onSendMessage: (
    dealId: string,
    body: string,
    messageType: DealMessage['messageType'],
    offerAmount?: number | null
  ) => void;
  onAdvanceEscrow: (dealId: string, nextStatus: EscrowStatus) => void;
  onSendOffer: (dealId: string, amount: number) => void;
}

export function DealRoomDrawer({
  isOpen,
  onClose,
  deals,
  activeDealId,
  onSelectDeal,
  messages,
  currentUser,
  onSendMessage,
  onAdvanceEscrow,
  onSendOffer,
}: DealRoomDrawerProps) {
  const [messageInput, setMessageInput] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [showCustomBox, setShowCustomBox] = useState(false);
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const activeDeal =
    deals.find((d) => d.id === activeDealId) ?? deals[0] ?? null;

  const dealMessages = activeDeal
    ? messages.filter((m) => m.dealId === activeDeal.id)
    : [];

  const nextStep = activeDeal
    ? getNextEscrowStatus(activeDeal.escrowStatus)
    : null;

  const handleSendText = (e: FormEvent) => {
    e.preventDefault();
    if (!activeDeal || !messageInput.trim()) return;
    onSendMessage(activeDeal.id, messageInput.trim(), 'text', null);
    setMessageInput('');
  };

  const handleSendOfferSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeDeal) return;
    const numeric = Number(offerInput);
    if (Number.isNaN(numeric) || numeric <= 0) return;
    onSendOffer(activeDeal.id, numeric);
    setOfferInput('');
    setShowOfferBox(false);
  };

  const handleSendCustomization = (e: FormEvent) => {
    e.preventDefault();
    if (!activeDeal || !customInput.trim()) return;
    onSendMessage(
      activeDeal.id,
      `Customization request: ${customInput.trim()}`,
      'customization_request',
      null
    );
    setCustomInput('');
    setShowCustomBox(false);
  };

  const getEscrowActionLabel = (current: EscrowStatus): string => {
    if (current === 'Negotiating') return 'Fund Escrow (Hold Payment)';
    if (current === 'Payment Held in Escrow') return 'Confirm Code/Access Delivered';
    if (current === 'Code/Access Delivered') return 'Mark as Purchased / Deal Closed';
    return 'Completed';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Direct Negotiation and Deal Room"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-3xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Direct Negotiation &amp; Deal Room
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time chat, minor customizations, formal offers, and escrow milestone tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Deal Room"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {deals.length === 0 || !activeDeal ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShieldCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <h3 className="mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
              No active deal rooms yet
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              Open any solution in Problem Details or the Solutions Marketplace and click &ldquo;Test Demo &amp; Chat with Builder&rdquo; to start a deal room.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
            {/* Left Thread Sidebar (if multiple deals) */}
            <aside className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 space-y-1.5 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Active Negotiations ({deals.length})
              </div>
              {deals.map((deal) => {
                const selected = deal.id === activeDeal.id;
                return (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => onSelectDeal(deal.id)}
                    className={`w-full text-left rounded-lg p-3 transition-colors border ${
                      selected
                        ? 'border-blue-600 bg-white dark:bg-slate-900 dark:border-blue-500'
                        : 'border-transparent hover:bg-white/70 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {deal.solutionTitle}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                      Builder: {deal.builderName}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-slate-700 dark:text-slate-300">
                        {formatCurrency(deal.offerAmount, deal.offerCurrency)}
                      </span>
                      <span
                        className={
                          deal.escrowStatus === 'Completed'
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-amber-700 dark:text-amber-400 font-medium'
                        }
                      >
                        {deal.escrowStatus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Right Active Deal Chat & Escrow Controls */}
            <div className="md:col-span-8 flex flex-col min-h-0">
              {/* Escrow Status & Actions Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {activeDeal.solutionTitle}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {activeDeal.licensingModel} · Offer:{' '}
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatCurrency(activeDeal.offerAmount, activeDeal.offerCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Escrow Status Tag (Explicit text + icon) */}
                  <div
                    data-testid="deal-escrow-status"
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                      activeDeal.escrowStatus === 'Completed'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {activeDeal.escrowStatus === 'Completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    <span>{activeDeal.escrowStatus}</span>
                  </div>
                </div>

                {/* Escrow Progress Bar */}
                <div className="grid grid-cols-4 gap-1.5">
                  {ESCROW_STEPS.map((step, index) => {
                    const currentIdx = ESCROW_STEPS.indexOf(activeDeal.escrowStatus);
                    const reached = index <= currentIdx;
                    return (
                      <div key={step} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            reached
                              ? activeDeal.escrowStatus === 'Completed'
                                ? 'bg-emerald-600'
                                : 'bg-blue-600'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                        <div className="text-[11px] leading-tight text-slate-600 dark:text-slate-400 truncate">
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Deal Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomBox((v) => !v);
                      setShowOfferBox(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Request Customization</span>
                  </button>

                  {activeDeal.escrowStatus !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => {
                        setOfferInput(String(activeDeal.offerAmount));
                        setShowOfferBox((v) => !v);
                        setShowCustomBox(false);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Send Purchase Offer</span>
                    </button>
                  )}

                  {nextStep && (
                    <button
                      type="button"
                      onClick={() => onAdvanceEscrow(activeDeal.id, nextStep)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors ml-auto"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{getEscrowActionLabel(activeDeal.escrowStatus)}</span>
                    </button>
                  )}
                </div>

                {/* Inline Customization Request Drawer */}
                {showCustomBox && (
                  <form onSubmit={handleSendCustomization} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Describe minor customization (e.g., add CSV header mapping)..."
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 dark:bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Send Request
                    </button>
                  </form>
                )}

                {/* Inline Formal Offer Box */}
                {showOfferBox && (
                  <form onSubmit={handleSendOfferSubmit} className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Offer ({activeDeal.offerCurrency}):
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={offerInput}
                      onChange={(e) => setOfferInput(e.target.value)}
                      className="w-28 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Submit Offer
                    </button>
                  </form>
                )}
              </div>

              {/* Message Feed */}
              <div
                data-testid="deal-messages-list"
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA] dark:bg-[#0B0F17]"
              >
                {dealMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  const isSystem =
                    msg.messageType === 'escrow_update' ||
                    msg.messageType === 'formal_offer';

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <div className="font-medium text-slate-900 dark:text-white">
                          {msg.senderName} ·{' '}
                          {msg.messageType === 'formal_offer'
                            ? 'Formal Offer'
                            : 'Escrow Milestone'}
                        </div>
                        <p className="mt-0.5">{msg.body}</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        {msg.senderName} ·{' '}
                        <span className="tabular-nums">
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                          isMe
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendText}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <label htmlFor="deal-room-chat-input" className="sr-only">
                  Message builder or poster
                </label>
                <input
                  id="deal-room-chat-input"
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Message about demo setup, customization, or delivery..."
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
