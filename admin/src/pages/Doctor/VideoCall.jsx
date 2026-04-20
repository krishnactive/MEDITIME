import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaComment, FaShare, FaStop, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { DoctorContext } from '../../context/DoctortContext';
import { getSocketBaseUrl, getPeerClientOptions } from '../../config/realtime';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const originalStreamRef = useRef(null); // Store original camera stream
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef({});
  const streamRef = useRef();
  const screenStreamRef = useRef(null);
  const roomJoinedRef = useRef(false);

  useEffect(() => {
    roomJoinedRef.current = false;
    const socketUrl = getSocketBaseUrl(backendUrl);
    socketRef.current = io(socketUrl, { transports: ["websocket", "polling"] });
    const myPeer = new Peer(undefined, getPeerClientOptions());

      const mediaPromise = navigator.mediaDevices
      .getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true 
      })
      .then((stream) => {
        streamRef.current = stream;
        originalStreamRef.current = stream;
        if (userVideo.current) userVideo.current.srcObject = stream;
        return stream;
      });

    myPeer.on("call", (call) => {
      call.on("stream", (remoteStream) => {
        addVideoStream(remoteStream, call.peer);
      });
      call.on("error", (err) => console.error("Peer incoming call error:", err));
      mediaPromise
        .then((stream) => {
          if (stream) call.answer(stream);
        })
        .catch(() => {});
    });

    const tryJoinRoom = () => {
      if (roomJoinedRef.current) return;
      const pid = myPeer.id;
      if (!pid || !socketRef.current?.connected) return;
      roomJoinedRef.current = true;
      socketRef.current.emit("join-room", roomId, pid);
    };
    myPeer.on("open", tryJoinRoom);
    socketRef.current.on("connect", tryJoinRoom);

    socketRef.current.on("user-connected", (userId) => {
      mediaPromise
        .then(() => connectToNewUser(userId, myPeer))
        .catch(() => {});
    });

    socketRef.current.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("user-disconnected", (userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
      }
      setPeers((prev) => {
        if (!prev[userId]) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    socketRef.current.on("remote-screen-share-toggle", (isSharing) => {
      console.log("Remote screen share toggled:", isSharing);
      // Optional: UI indication for remote screen sharing
    });

    mediaPromise.catch((err) => {
      console.error("Error accessing media devices:", err);
      alert("Camera and microphone access is required for video calls");
      navigate("/doctor-appointments");
    });

    return () => {
      roomJoinedRef.current = false;
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      myPeer.destroy();
      socketRef.current.disconnect();
    };
  }, [roomId, navigate, backendUrl]);

  useEffect(() => {
    // Fetch appointment data to get appointmentId
    const fetchAppointment = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
          headers: { dtoken: dToken }
        });
        const list = Array.isArray(data.appointments) ? data.appointments : [];
        const appointment = list.find(app => app.callRoomId === roomId);
        if (appointment) {
          setAppointmentId(appointment._id);
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
      }
    };

    if (dToken) {
      fetchAppointment();
    }
  }, [roomId, dToken, backendUrl]);

  useEffect(() => {
    if (appointmentId && !callStarted) {
      axios.post(`${backendUrl}/api/doctor/start-call`, { appointmentId }, {
        headers: { dtoken: dToken }
      }).then((res) => {
        if (res.data?.success) setCallStarted(true);
      }).catch(console.error);
    }
  }, [appointmentId, callStarted, backendUrl, dToken]);

  const connectToNewUser = (userId, myPeer) => {
    const stream = streamRef.current;
    if (!stream) return;
    const call = myPeer.call(userId, stream);
    call.on("error", (err) => console.error("Peer outgoing call error:", err));
    call.on("stream", (userVideoStream) => {
      addVideoStream(userVideoStream, userId);
    });
    call.on("close", () => {
      removeVideoStream(userId);
    });
    peersRef.current[userId] = call;
  };

  const addVideoStream = (videoStream, userId) => {
    setPeers(prevPeers => ({
      ...prevPeers,
      [userId]: videoStream
    }));
  };

  const removeVideoStream = (userId) => {
    setPeers(prevPeers => {
      const newPeers = { ...prevPeers };
      delete newPeers[userId];
      return newPeers;
    });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (isScreenSharing) return;
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const replaceVideoOnAllCalls = (videoTrack) => {
    console.log("Attempting replace track with:", videoTrack ? "screen track" : "camera track");
    Object.values(peersRef.current).forEach((call, index) => {
      try {
        const pc = call?.peerConnection;
        if (!pc) {
          console.warn(`No peerConnection for call ${index}`);
          return;
        }
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (!sender) {
          console.warn(`No video sender for call ${index}`);
          return;
        }
        sender.replaceTrack(videoTrack).then(() => {
          console.log(`replaceTrack success for call ${index}`);
        }).catch(err => {
          console.error(`replaceTrack failed for call ${index}:`, err);
        });
      } catch (err) {
        console.error(`Error replacing track for call ${index}:`, err);
      }
    });
  };

  const stopScreenShare = async () => {
    console.log("Stopping screen share");
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    
    // Signal to peers
    socketRef.current.emit('screen-share-toggle', roomId, false);
    
    const camStream = originalStreamRef.current || streamRef.current;
    if (camStream && userVideo.current) {
      userVideo.current.srcObject = camStream;
    }
    setIsScreenSharing(false);
    
    // Fallback: replace with camera track
    const camVideoTrack = camStream?.getVideoTracks()[0];
    replaceVideoOnAllCalls(camVideoTrack);
  };

  const endCall = async () => {
    if (appointmentId && callStarted) {
      try {
        await axios.post(`${backendUrl}/api/doctor/end-call`, { appointmentId }, {
          headers: { dtoken: dToken }
        });
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    navigate('/doctor-appointments');
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = { text: newMessage, sender: 'Doctor', timestamp: new Date() };
      setMessages(prev => [...prev, message]);
      socketRef.current.emit('send-message', roomId, message);
      setNewMessage('');
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    
    console.log("Starting screen share");
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false 
      });
      
      screenStreamRef.current = screenStream;
      originalStreamRef.current = streamRef.current; // Backup camera stream
      
      const videoTrack = screenStream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error("No video track from screen capture");
        return;
      }
      
      videoTrack.addEventListener('ended', () => {
        console.log("Screen share ended by user");
        stopScreenShare();
      });
      
      // Update local video
      if (userVideo.current) {
        userVideo.current.srcObject = screenStream;
      }
      
      // Send to peers
      replaceVideoOnAllCalls(videoTrack);
      
      // Signal remote peers
      socketRef.current.emit('screen-share-toggle', roomId, true);
      
      setIsScreenSharing(true);
      console.log("Screen share started successfully");
    } catch (err) {
      console.error('Error sharing screen:', err);
      alert("Screen sharing failed. Please check browser permissions and ensure HTTPS/localhost.");
    }
  };

  const peerKeys = Object.keys(peers);
  const mainPeerKey = peerKeys[0];

  return (
    <div className="video-call relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-black text-white max-md:fixed max-md:inset-0 max-md:z-[100] md:h-screen">
      <div className="relative min-h-0 flex-1 w-full md:p-4">
        <div className="absolute inset-0 md:static md:grid md:h-full md:min-h-[240px] md:grid-cols-2 md:gap-4 md:items-stretch">
          {mainPeerKey ? (
            <div className="absolute inset-0 z-0 md:relative md:z-auto md:order-2 md:min-h-0 md:overflow-hidden md:rounded-xl">
              <RemoteVideo stream={peers[mainPeerKey]} label="Patient" fill />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 bg-neutral-950 px-6 text-center md:relative md:hidden">
              <p className="text-base font-medium text-white/90">Connecting…</p>
              <p className="text-sm text-white/50">Waiting for the patient to join</p>
            </div>
          )}

          {peerKeys.slice(1).map((key) => (
            <div key={key} className="hidden min-h-0 md:block md:overflow-hidden md:rounded-xl">
              <RemoteVideo stream={peers[key]} label="Patient" />
            </div>
          ))}

          <div
            className={
              'pointer-events-none absolute z-20 md:pointer-events-auto md:static md:z-auto md:flex md:h-full md:min-h-0 md:order-1 ' +
              'bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] right-3 aspect-[3/4] w-[32vw] max-w-[150px] overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white/35 md:aspect-auto md:w-full md:max-w-none md:rounded-xl md:shadow-none md:ring-0'
            }
          >
            <div className="pointer-events-auto relative h-full w-full">
              <video
                ref={userVideo}
                autoPlay
                muted
                playsInline
                className={`h-full w-full bg-black md:rounded-xl md:border-2 md:border-green-500 ${
                  isScreenSharing ? 'object-contain' : 'object-cover'
                }`}
              />
              <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/65 px-2 py-0.5 text-xs font-medium">
                You
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-gray-900/95 px-2 py-3 backdrop-blur-sm md:gap-4 md:py-4"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          type="button"
          onClick={toggleMute}
          className={`touch-manipulation flex h-14 w-14 shrink-0 items-center justify-center rounded-full active:scale-95 md:h-12 md:w-12 ${
            isMuted ? 'bg-red-500' : 'bg-white/15'
          }`}
        >
          {isMuted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
        </button>
        <button
          type="button"
          onClick={toggleVideo}
          disabled={isScreenSharing}
          title={isScreenSharing ? 'Stop screen share to change camera' : 'Camera on/off'}
          className={`touch-manipulation flex h-14 w-14 shrink-0 items-center justify-center rounded-full active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 md:h-12 md:w-12 ${
            isVideoOff ? 'bg-red-500' : 'bg-white/15'
          }`}
        >
          {isVideoOff ? <FaVideoSlash size={22} /> : <FaVideo size={22} />}
        </button>
        <button
          type="button"
          onClick={shareScreen}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className={`touch-manipulation flex h-14 w-14 shrink-0 items-center justify-center rounded-full active:scale-95 md:h-12 md:w-12 ${
            isScreenSharing ? 'bg-amber-600' : 'bg-white/15'
          }`}
        >
          {isScreenSharing ? <FaStop size={22} /> : <FaShare size={22} />}
        </button>
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="touch-manipulation flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 active:scale-95 md:h-12 md:w-12"
        >
          <FaComment size={22} />
        </button>
        <button
          type="button"
          onClick={endCall}
          className="touch-manipulation flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-600 active:scale-95 md:h-12 md:w-12"
        >
          <FaPhoneSlash size={22} />
        </button>
      </div>

      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 md:justify-start md:bg-transparent md:p-4">
          <div className="mx-auto flex max-h-[min(85dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white text-gray-900 shadow-2xl md:mx-0 md:max-h-[calc(100vh-6rem)] md:rounded-xl md:rounded-tr-2xl">
            <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">Chat</h3>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="touch-manipulation rounded-full p-2 hover:bg-gray-100"
                aria-label="Close chat"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div key={index} className="mb-2 text-sm">
                  <span className="font-semibold">{msg.sender}:</span> {msg.text}
                </div>
              ))}
            </div>
            <div
              className="flex shrink-0 gap-0 border-t p-3"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-12 flex-1 rounded-l-lg border border-r-0 border-gray-300 px-3 text-base outline-none focus:border-blue-500"
                placeholder="Message…"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="touch-manipulation min-h-12 rounded-r-lg bg-blue-600 px-4 text-sm font-medium text-white active:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function RemoteVideo({ stream, label, fill }) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    const play = () => {
      el.play().catch(() => {});
    };
    play();
    stream.addEventListener('addtrack', play);
    return () => stream.removeEventListener('addtrack', play);
  }, [stream]);

  return (
    <div
      className={
        fill
          ? 'relative h-full min-h-0 w-full bg-black'
          : 'relative min-h-[200px] w-full rounded-xl bg-black md:min-h-0 md:h-full'
      }
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={false}
        className={
          fill
            ? 'h-full w-full object-cover'
            : 'h-full min-h-[200px] w-full rounded-xl border-2 border-blue-500 object-contain md:min-h-0 md:object-cover'
        }
      />
      <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {label}
      </div>
    </div>
  );
}

export default VideoCall;