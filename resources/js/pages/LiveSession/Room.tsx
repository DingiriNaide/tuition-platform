import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import axios from 'axios';
import { start, end, chat, hand, } from '@/actions/App/Http/Controllers/LiveSessionController';
import { motion, AnimatePresence } from 'motion/react';
import LoadingOverlay from '@/components/LoadingOverlay';

// ── Types ─────────────────────────────────────────────────────────────

interface LiveSessionData {
    id: number;
    channel_name: string;
    status: 'waiting' | 'live' | 'ended';
    started_at: string | null;
    course: { title: string; subject: string };
}

interface CurrentUser {
    id: string;
    name: string;
    is_tutor: boolean;
}

interface ChatMessage {
    from_user_id: string;
    from_name: string;
    message: string;
    sent_at: string;
}

interface HandRaise {
    user_id: string;
    name: string;
}

interface Props {
    liveSession: LiveSessionData;
    currentUser: CurrentUser;
}

// ── Component ─────────────────────────────────────────────────────────

export default function LiveRoom({ liveSession, currentUser }: Props) {
    const [sessionStatus, setSessionStatus]   = useState(liveSession.status);
    const [chatMessages, setChatMessages]      = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput]            = useState('');
    const [handRaises, setHandRaises]          = useState<Map<string, HandRaise>>(new Map());
    const [myHandRaised, setMyHandRaised]      = useState(false);
    const [showChat, setShowChat]              = useState(true);
    const [showParticipants, setShowParticipants] = useState(false);
    const [sessionEnded, setSessionEnded]      = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isEnding, setIsEnding]     = useState(false);
    const [isJoining, setIsJoining]   = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    const handleChatMessage = useCallback((msg: ChatMessage) => {
        if (msg.from_user_id !== currentUser.id) {
            setChatMessages((prev) => [...prev, msg]);
        }
    }, [currentUser.id]);

    const handleLiveEvent = useCallback((type: string, data: Record<string, string>) => {
        if (type === 'session-started') setSessionStatus('live');
        if (type === 'session-ended') { setSessionStatus('ended'); setSessionEnded(true); }
        if (type === 'hand-raised') setHandRaises((prev) => { const n = new Map(prev); n.set(data.user_id, { user_id: data.user_id, name: data.name }); return n; });
        if (type === 'hand-lowered') setHandRaises((prev) => { const n = new Map(prev); n.delete(data.user_id); return n; });
    }, []);

    const {
        localStream, participants, audioEnabled, videoEnabled,
        isConnecting, error, connect, disconnect, toggleAudio, toggleVideo,
    } = useWebRTC({
        liveSessionId: liveSession.id,
        channelName:   liveSession.channel_name,
        currentUserId: currentUser.id,
        isTutor:       currentUser.is_tutor,
        onChatMessage: handleChatMessage,
        onLiveEvent: handleLiveEvent,
    });

    // ── Attach local stream to video element ──────────────────────────

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // ── Reverb non-signal events ──────────────────────────────────────

    /* useEffect(() => {
        const channel = window.Echo.join(`live.${liveSession.channel_name}`);

        channel
            .listen('.live-event', (e: { type: string; data: Record<string, string> }) => {
                if (e.type === 'session-started') {
                    setSessionStatus('live');
                }
                if (e.type === 'session-ended') {
                    setSessionStatus('ended');
                    setSessionEnded(true);
                    disconnect();
                }
                if (e.type === 'hand-raised') {
                    setHandRaises((prev) => {
                        const next = new Map(prev);
                        next.set(e.data.user_id, { user_id: e.data.user_id, name: e.data.name });
                        return next;
                    });
                }
                if (e.type === 'hand-lowered') {
                    setHandRaises((prev) => {
                        const next = new Map(prev);
                        next.delete(e.data.user_id);
                        return next;
                    });
                }
            })
            .listen('.chat-message', (msg: ChatMessage) => {
                if (msg.from_user_id !== currentUser.id) {
                    setChatMessages((prev) => [...prev, msg]);
                }
            });

        return () => {
            window.Echo.leave(`live.${liveSession.channel_name}`);
        };
    }, [liveSession.channel_name, disconnect]); */

    // ── Scroll chat to bottom ─────────────────────────────────────────

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // ── Tutor controls ────────────────────────────────────────────────

    async function handleStart(): Promise<void> {
        setIsStarting(true);
        try {
            await connect();
            await axios.post(start.url(liveSession.id));
            setSessionStatus('live');
        } finally {
            setIsStarting(false);
        }
    }

    async function handleEnd(): Promise<void> {
        if (!confirm('End the session for all participants?')) return;
        setIsEnding(true);
        try {
            await axios.post(end.url(liveSession.id));
            disconnect();
            setSessionStatus('ended');
            setSessionEnded(true);
        } finally {
            setIsEnding(false);
        }
    }

    // ── Student join ──────────────────────────────────────────────────

    async function handleJoin(): Promise<void> {
        setIsJoining(true);
        try {
            await connect();
        } finally {
            setIsJoining(false);
        }
    }

    // ── Chat ──────────────────────────────────────────────────────────

    async function sendChat(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const message = chatInput.trim();
        setChatInput('');

        // Add own message immediately — don't wait for broadcast
        setChatMessages((prev) => [...prev, {
            from_user_id: currentUser.id,
            from_name:    currentUser.name,
            message,
            sent_at:      new Date().toISOString(),
        }]);

        await axios.post(chat.url(liveSession.id), { message });
    }

    // ── Hand raise ────────────────────────────────────────────────────

    async function toggleHand(): Promise<void> {
        const next = !myHandRaised;
        setMyHandRaised(next);
        await axios.post(hand.url(liveSession.id), { raised: next });
    }

    // ── Ended screen ──────────────────────────────────────────────────

    if (sessionEnded) {
        return (
            <>
                <Head title="Session Ended" />
                <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                    <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.677V15.32a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Session Ended</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        The live session has ended.
                    </p>
                    <button
                        onClick={() => router.visit('/dashboard')}
                        className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </>
        );
    }

    const participantList = Array.from(participants.values());
    const totalTiles      = participantList.filter((p) => p.stream).length;

    return (
        <>
            <Head title={`Live — ${liveSession.course.title}`} />

            <LoadingOverlay
                show={isStarting}
                message="Starting session…"
                variant="fullscreen"
            />
            <LoadingOverlay
                show={isEnding}
                message="Ending session…"
                variant="fullscreen"
            />
            <LoadingOverlay
                show={isJoining}
                message="Joining session…"
                variant="fullscreen"
            />

            {/* Full-viewport layout — no page padding */}
            <div className="flex h-screen overflow-hidden bg-gray-950">

                {/* ── Video grid ── */}
                <div className="relative flex flex-1 flex-col">

                    {/* Course title bar */}
                    <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
                        <div>
                            <p className="text-sm font-semibold text-white">
                                {liveSession.course.title}
                            </p>
                            <p className="text-xs text-gray-400">{liveSession.course.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {sessionStatus === 'live' && (
                                <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                    LIVE
                                </span>
                            )}
                            {sessionStatus === 'waiting' && (
                                <span className="rounded-full bg-yellow-600 px-3 py-1 text-xs font-semibold text-white">
                                    Waiting
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Error banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-b border-red-800 bg-red-900/50 px-4 py-2 text-sm text-red-300 overflow-hidden"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hand raises notification */}
                    <AnimatePresence>
                        {handRaises.size > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-b border-yellow-800 bg-yellow-900/40 px-4 py-2 overflow-hidden"
                            >
                                <p className="text-xs text-yellow-300">
                                    ✋ {Array.from(handRaises.values()).map((h) => h.name).join(', ')} raised hand
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Videos */}
                    <div className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto p-3">

                        {/* Local video tile */}
                        <VideoTile
                            label={`${currentUser.name} (You)`}
                            isMuted
                            videoRef={localVideoRef}
                            stream={localStream}
                            audioEnabled={audioEnabled}
                            videoEnabled={videoEnabled}
                        />

                        {/* Remote participant tiles */}
                        {participantList
                            .filter((p) => p.stream)
                            .map((p) => (
                                <RemoteVideoTile
                                    key={p.id}
                                    participant={p}
                                    hasHandRaised={handRaises.has(p.id)}
                                />
                            ))}

                        {/* Waiting state — no video yet */}
                        {!localStream && (
                            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
                                <div className="h-16 w-16 rounded-full bg-gray-800 p-4">
                                    <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.677V15.32a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                    </svg>
                                </div>
                                {currentUser.is_tutor ? (
                                    <div className="text-center">
                                        <p className="mb-4 text-gray-400">
                                            {sessionStatus === 'waiting'
                                                ? 'Start the session when your students are ready.'
                                                : 'Session is live.'}
                                        </p>
                                        <button
                                            onClick={handleStart}
                                            disabled={isConnecting}
                                            className="rounded-md bg-green-600 px-8 py-3 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
                                        >
                                            {isConnecting ? 'Starting…' : '▶ Start Session'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="mb-4 text-gray-400">
                                            {sessionStatus === 'waiting'
                                                ? 'Waiting for tutor to start the session…'
                                                : 'Session is live. Join now.'}
                                        </p>
                                        {/* Fixed: allow join in both waiting and live states */}
                                        <button
                                            onClick={handleJoin}
                                            disabled={isConnecting}
                                            className="rounded-md bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                                        >
                                            {isConnecting ? 'Joining…' : sessionStatus === 'waiting' ? 'Join Waiting Room' : 'Join Session'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Control bar ── */}
                    {localStream && (
                        <div className="flex items-center justify-center gap-3 border-t border-gray-800 bg-gray-900 px-4 py-3">

                            <ControlButton
                                active={audioEnabled}
                                onClick={toggleAudio}
                                activeTitle="Mute"
                                inactiveTitle="Unmute"
                                activeIcon="🎤"
                                inactiveIcon="🔇"
                            />

                            <ControlButton
                                active={videoEnabled}
                                onClick={toggleVideo}
                                activeTitle="Stop video"
                                inactiveTitle="Start video"
                                activeIcon="📷"
                                inactiveIcon="🚫"
                            />

                            {!currentUser.is_tutor && (
                                <button
                                    onClick={toggleHand}
                                    title={myHandRaised ? 'Lower hand' : 'Raise hand'}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        myHandRaised
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    ✋ {myHandRaised ? 'Lower Hand' : 'Raise Hand'}
                                </button>
                            )}

                            <button
                                onClick={() => setShowChat((v) => !v)}
                                className="rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-600"
                            >
                                💬 Chat
                                {chatMessages.length > 0 && (
                                    <span className="ml-1.5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs">
                                        {chatMessages.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setShowParticipants((v) => !v)}
                                className="rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-600"
                            >
                                👥 {participants.size + 1}
                            </button>

                            {currentUser.is_tutor && (
                                <button
                                    onClick={handleEnd}
                                    className="rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
                                >
                                    ■ End Session
                                </button>
                            )}

                            {!currentUser.is_tutor && (
                                <button
                                    onClick={() => {
                                        disconnect();
                                        router.visit('/bookings');
                                    }}
                                    className="rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
                                >
                                    Leave
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Chat sidebar ── */}
                {showChat && (
                    <div className="flex w-72 shrink-0 flex-col border-l border-gray-800 bg-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                            <p className="text-sm font-semibold text-white">Chat</p>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-gray-500 hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 space-y-3 overflow-y-auto p-3">
                            {chatMessages.length === 0 && (
                                <p className="text-center text-xs text-gray-500">
                                    No messages yet
                                </p>
                            )}
                            {chatMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col ${
                                        msg.from_user_id === currentUser.id
                                            ? 'items-end'
                                            : 'items-start'
                                    }`}
                                >
                                    <p className="mb-0.5 text-xs text-gray-500">
                                        {msg.from_user_id === currentUser.id ? 'You' : msg.from_name}
                                    </p>
                                    <div
                                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                            msg.from_user_id === currentUser.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-700 text-gray-200'
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={sendChat}
                            className="flex gap-2 border-t border-gray-800 p-3"
                        >
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Send a message…"
                                className="flex-1 rounded-md bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Participants sidebar ── */}
                {showParticipants && (
                    <div className="flex w-60 shrink-0 flex-col border-l border-gray-800 bg-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                            <p className="text-sm font-semibold text-white">
                                Participants ({participants.size + 1})
                            </p>
                            <button
                                onClick={() => setShowParticipants(false)}
                                className="text-gray-500 hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                            {/* Self */}
                            <ParticipantRow
                                name={currentUser.name}
                                role={currentUser.is_tutor ? 'tutor' : 'student'}
                                isSelf
                                hasHand={false}
                            />
                            {/* Others */}
                            {participantList.map((p) => (
                                <ParticipantRow
                                    key={p.id}
                                    name={p.name}
                                    role={p.role}
                                    isSelf={false}
                                    hasHand={handRaises.has(p.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ── Sub-components ────────────────────────────────────────────────────

function VideoTile({
    label, isMuted, videoRef, stream, audioEnabled, videoEnabled,
}: {
    label: string; isMuted: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    stream: MediaStream | null;
    audioEnabled: boolean; videoEnabled: boolean;
}) {
    // Re-attach stream whenever it changes
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, videoRef]);

    return (
        <div className="relative h-48 w-72 overflow-hidden rounded-lg bg-gray-800">
            {/* Always rendered — hidden via CSS when video off */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className={`h-full w-full object-cover ${stream && videoEnabled ? '' : 'hidden'}`}
            />
            {/* Avatar shown when no stream or video off */}
            {(!stream || !videoEnabled) && (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-2xl">
                        👤
                    </div>
                </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <span className="rounded bg-black/60 px-2 py-0.5 text-xs text-white">{label}</span>
                {!audioEnabled && <span className="rounded bg-red-600/80 px-1.5 py-0.5 text-xs text-white">🔇</span>}
            </div>
        </div>
    );
}

function RemoteVideoTile({ participant, hasHandRaised }: {
    participant: { id: string; name: string; role: string; stream: MediaStream | null };
    hasHandRaised: boolean;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && participant.stream) {
            videoRef.current.srcObject = participant.stream;
        }
    }, [participant.stream]);

    return (
        <div className={`relative h-48 w-72 overflow-hidden rounded-lg ${hasHandRaised ? 'ring-2 ring-yellow-400' : ''} bg-gray-800`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover ${participant.stream ? '' : 'hidden'}`}
            />
            {!participant.stream && (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-2xl">👤</div>
                </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <span className="rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                    {participant.name}{participant.role === 'tutor' && ' (Tutor)'}
                </span>
                {hasHandRaised && <span className="rounded bg-yellow-500/90 px-1.5 py-0.5 text-xs text-white">✋</span>}
            </div>
        </div>
    );
}

function ControlButton({
    active,
    onClick,
    activeTitle,
    inactiveTitle,
    activeIcon,
    inactiveIcon,
}: {
    active: boolean;
    onClick: () => void;
    activeTitle: string;
    inactiveTitle: string;
    activeIcon: string;
    inactiveIcon: string;
}) {
    return (
        <button
            onClick={onClick}
            title={active ? activeTitle : inactiveTitle}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-red-700 text-white hover:bg-red-600'
            }`}
        >
            {active ? activeIcon : inactiveIcon}
        </button>
    );
}

function ParticipantRow({
    name,
    role,
    isSelf,
    hasHand,
}: {
    name: string;
    role: string;
    isSelf: boolean;
    hasHand: boolean;
}) {
    return (
        <div className="flex items-center gap-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-sm">
                {role === 'tutor' ? '🎓' : '👤'}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-200">
                    {name}
                    {isSelf && <span className="ml-1 text-xs text-gray-500">(you)</span>}
                </p>
                <p className="text-xs capitalize text-gray-500">{role}</p>
            </div>
            {hasHand && <span className="text-sm">✋</span>}
        </div>
    );
}
