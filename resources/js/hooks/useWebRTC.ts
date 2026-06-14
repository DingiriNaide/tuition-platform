// resources/js/hooks/useWebRTC.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { signal, } from '@/actions/App/Http/Controllers/LiveSessionController';

let Echo: any;
if (typeof window !== 'undefined') {
    import('@/echo').then((module) => {
        Echo = module.default;
    });
}

// ── Types ─────────────────────────────────────────────────────────────

interface Participant {
    id: string;
    name: string;
    role: string;
    stream: MediaStream | null;
}

interface SignalPayload {
    type: string;
    from_user_id: string;
    to_user_id: string;
    payload: RTCSessionDescriptionInit | RTCIceCandidateInit | null;
}

interface UseWebRTCOptions {
    liveSessionId: number;
    channelName: string;
    currentUserId: string;
    isTutor: boolean;
    onChatMessage?: (msg: { from_user_id: string; from_name: string; message: string; sent_at: string }) => void;
    onLiveEvent?: (type: string, data: Record<string, string>) => void;
}

// ── ICE servers ───────────────────────────────────────────────────────
// STUN only for dev — add TURN for production deployments.

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

// ── Hook ──────────────────────────────────────────────────────────────

export function useWebRTC({
    liveSessionId,
    channelName,
    currentUserId,
    isTutor,
    onChatMessage,
    onLiveEvent,
}: UseWebRTCOptions) {
    const [localStream, setLocalStream]     = useState<MediaStream | null>(null);
    const [participants, setParticipants]   = useState<Map<string, Participant>>(new Map());
    const [audioEnabled, setAudioEnabled]   = useState(true);
    const [videoEnabled, setVideoEnabled]   = useState(true);
    const [isConnecting, setIsConnecting]   = useState(false);
    const [error, setError]                 = useState<string | null>(null);

    // Map of userId → RTCPeerConnection
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStreamRef  = useRef<MediaStream | null>(null);
    const channelRef      = useRef<ReturnType<typeof window.Echo.join> | null>(null);

    // ── Get local media ───────────────────────────────────────────────

    const startLocalMedia = useCallback(async (): Promise<MediaStream | null> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true },
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            setError('Camera/microphone access denied. Please allow permissions and refresh.');
            return null;
        }
    }, []);

    // ── Create peer connection for a remote user ──────────────────────

    const createPeerConnection = useCallback((
        remoteUserId: string,
        remoteName: string,
        remoteRole: string,
        stream: MediaStream,
    ): RTCPeerConnection => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to the connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // When remote track arrives — display it
        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            setParticipants((prev) => {
                const next = new Map(prev);
                const existing = next.get(remoteUserId);
                next.set(remoteUserId, {
                    id:     remoteUserId,
                    name:   existing?.name ?? remoteName,
                    role:   existing?.role ?? remoteRole,
                    stream: remoteStream,
                });
                return next;
            });
        };

        // ICE candidates — relay via Reverb
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                axios.post(signal.url(liveSessionId), {
                    type:       'ice-candidate',
                    to_user_id: remoteUserId,
                    payload:    event.candidate.toJSON(),
                });
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                setParticipants((prev) => {
                    const next = new Map(prev);
                    const existing = next.get(remoteUserId);
                    if (existing) {
                        next.set(remoteUserId, { ...existing, stream: null });
                    }
                    return next;
                });
            }
        };

        peerConnections.current.set(remoteUserId, pc);
        return pc;
    }, [liveSessionId]);

    // ── Initiate offer (caller side) ──────────────────────────────────

    const initiateOffer = useCallback(async (
        remoteUserId: string,
        remoteName: string,
        remoteRole: string,
    ): Promise<void> => {
        const stream = localStreamRef.current;
        if (!stream) return;

        const pc = createPeerConnection(remoteUserId, remoteName, remoteRole, stream);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await axios.post(signal.url(liveSessionId), {
            type:       'offer',
            to_user_id: remoteUserId,
            payload:    offer,
        });
    }, [createPeerConnection, liveSessionId]);

    // ── Handle incoming signal ────────────────────────────────────────

    const handleSignal = useCallback(async (data: SignalPayload): Promise<void> => {
        // Ignore signals not addressed to us
        if (data.to_user_id && data.to_user_id !== currentUserId) return;
        // Ignore own signals
        if (data.from_user_id === currentUserId) return;

        const stream = localStreamRef.current;
        if (!stream) return;

        const fromUserId = data.from_user_id;

        if (data.type === 'offer') {
            // We received an offer — create answer
            let pc = peerConnections.current.get(fromUserId);
            if (!pc) {
                pc = createPeerConnection(fromUserId, '', '', stream);
            }

            await pc.setRemoteDescription(
                new RTCSessionDescription(data.payload as RTCSessionDescriptionInit)
            );

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await axios.post(signal.url(liveSessionId), {
                type:       'answer',
                to_user_id: fromUserId,
                payload:    answer,
            });
        }

        if (data.type === 'answer') {
            const pc = peerConnections.current.get(fromUserId);
            if (pc && pc.signalingState !== 'stable') {
                await pc.setRemoteDescription(
                    new RTCSessionDescription(data.payload as RTCSessionDescriptionInit)
                );
            }
        }

        if (data.type === 'ice-candidate') {
            const pc = peerConnections.current.get(fromUserId);
            if (pc && data.payload) {
                try {
                    await pc.addIceCandidate(
                        new RTCIceCandidate(data.payload as RTCIceCandidateInit)
                    );
                } catch {
                    // Silently ignore stale candidates
                }
            }
        }
    }, [currentUserId, createPeerConnection, liveSessionId]);

    // ── Join Reverb presence channel ──────────────────────────────────

    const joinChannel = useCallback((
        stream: MediaStream,
        onChatMessage?: UseWebRTCOptions['onChatMessage'],
        onLiveEvent?: UseWebRTCOptions['onLiveEvent'],
    ): void => {
        const channel = window.Echo.join(`live.${channelName}`);

        channel
            .here((members: { id: string; name: string; role: string }[]) => {
                // When we join, initiate offers to everyone already in the room
                members.forEach((member) => {
                    if (member.id !== currentUserId) {
                        initiateOffer(member.id, member.name, member.role);
                    }
                });
            })
            .joining((member: { id: string; name: string; role: string }) => {
                // New participant joined — they will send us an offer
                setParticipants((prev) => {
                    const next = new Map(prev);
                    next.set(member.id, {
                        id:     member.id,
                        name:   member.name,
                        role:   member.role,
                        stream: null,
                    });
                    return next;
                });
            })
            .leaving((member: { id: string }) => {
                // Clean up when someone leaves
                const pc = peerConnections.current.get(member.id);
                pc?.close();
                peerConnections.current.delete(member.id);

                setParticipants((prev) => {
                    const next = new Map(prev);
                    next.delete(member.id);
                    return next;
                });
            })
            .listenForWhisper('signal', handleSignal)
            .listen('.signal', handleSignal)
            .listen('.live-event', (e: { type: string; data: Record<string, string> }) => {
                onLiveEvent?.(e.type, e.data);
            })
            .listen('.chat-message', (msg: { from_user_id: string; from_name: string; message: string; sent_at: string }) => {
                onChatMessage?.(msg);
            });

        channelRef.current = channel;
    }, [channelName, currentUserId, handleSignal, initiateOffer]);

    // ── Connect ───────────────────────────────────────────────────────

    const connect = useCallback(async (): Promise<void> => {
        setIsConnecting(true);
        setError(null);

        const stream = await startLocalMedia();
        if (!stream) {
            setIsConnecting(false);
            return;
        }

        joinChannel(stream, onChatMessage, onLiveEvent);
        setIsConnecting(false);
    }, [startLocalMedia, joinChannel, onChatMessage, onLiveEvent]);

    // ── Media controls ────────────────────────────────────────────────

    const toggleAudio = useCallback((): void => {
        if (!localStreamRef.current) return;
        const audioTracks = localStreamRef.current.getAudioTracks();
        const newState    = !audioEnabled;
        audioTracks.forEach((t) => { t.enabled = newState; });
        setAudioEnabled(newState);
    }, [audioEnabled]);

    const toggleVideo = useCallback((): void => {
        if (!localStreamRef.current) return;
        const videoTracks = localStreamRef.current.getVideoTracks();
        const newState    = !videoEnabled;
        videoTracks.forEach((t) => { t.enabled = newState; });
        setVideoEnabled(newState);
    }, [videoEnabled]);

    // ── Disconnect ────────────────────────────────────────────────────

    const disconnect = useCallback((): void => {
        // Close all peer connections
        peerConnections.current.forEach((pc) => pc.close());
        peerConnections.current.clear();

        // Stop local tracks
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);

        // Leave Reverb channel
        window.Echo.leave(`live.${channelName}`);
        channelRef.current = null;

        setParticipants(new Map());
    }, [channelName]);

    // ── Cleanup on unmount ────────────────────────────────────────────

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    

    return {
        localStream,
        participants,
        audioEnabled,
        videoEnabled,
        isConnecting,
        error,
        connect,
        disconnect,
        toggleAudio,
        toggleVideo,
    };
}
