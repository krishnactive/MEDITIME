import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaComment, FaShare, FaStop, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { getSocketBaseUrl, getPeerClientOptions } from '../config/realtime';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef({});
  const streamRef = useRef();
  const screenStreamRef = useRef(null);
  const roomJoinedRef = useRef(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    roomJoinedRef.current = false;
    const socketUrl = getSocketBaseUrl(backendUrl);
    socketRef.current = io(socketUrl, { transports: ["websocket", "polling"] });
    const myPeer = new Peer(undefined, getPeerClientOptions());

    const mediaPromise = navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
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

    mediaPromise.catch((err) => {
      console.error("Error accessing media devices:", err);
      alert("Camera and microphone access is required for video calls");
      navigate("/my-appointments");
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
        const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
          headers: { token }
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

    if (token) {
      fetchAppointment();
    }
  }, [roomId, token, backendUrl]);

  useEffect(() => {
    if (appointmentId && !callStarted) {
      axios.post(`${backendUrl}/api/user/start-call`, { appointmentId }, {
        headers: { token }
      }).then((res) => {
        if (res.data?.success) setCallStarted(true);
      }).catch(console.error);
    }
  }, [appointmentId, callStarted, backendUrl, token]);

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
    Object.values(peersRef.current).forEach(call => {
      const pc = call?.peerConnection;
      if (!pc) return;
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (!sender) return;
      if (videoTrack) sender.replaceTrack(videoTrack);
      else sender.replaceTrack(null);
    });
  };

  const stopScreenShare = () => {
    const screen = screenStreamRef.current;
    if (screen) {
      screen.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    const cam = streamRef.current;
    const camVideo = cam?.getVideoTracks()[0];
    replaceVideoOnAllCalls(camVideo ?? null);
    if (userVideo.current && cam) userVideo.current.srcObject = cam;
    setIsScreenSharing(false);
  };

  const endCall = async () => {
    if (appointmentId && callStarted) {
      try {
        await axios.post(`${backendUrl}/api/user/end-call`, { appointmentId }, {
          headers: { token }
        });
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    navigate('/my-appointments');
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = { text: newMessage, sender: 'You', timestamp: new Date() };
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
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screenStream;
      const videoTrack = screenStream.getVideoTracks()[0];
      if (!videoTrack) return;
      videoTrack.addEventListener('ended', () => {
        stopScreenShare();
      });
      replaceVideoOnAllCalls(videoTrack);
      if (userVideo.current) userVideo.current.srcObject = screenStream;
      setIsScreenSharing(true);
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  return (
    <div className="video-call relative h-screen bg-gray-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="video-grid grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          <div className="relative">
            <video
              ref={userVideo}
              autoPlay
              muted
              playsInline
              className={`w-full h-full rounded-lg border-2 border-blue-500 bg-black ${isScreenSharing ? 'object-contain' : 'object-cover'}`}
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              You
            </div>
          </div>
          {Object.keys(peers).map(key => (
            <Video key={key} stream={peers[key]} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center items-center space-x-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition`}
        >
          {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </button>
        <button
          type="button"
          onClick={toggleVideo}
          disabled={isScreenSharing}
          title={isScreenSharing ? 'Stop screen share to change camera' : 'Camera on/off'}
          className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
        </button>
        <button
          type="button"
          onClick={shareScreen}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className={`p-3 rounded-full transition ${isScreenSharing ? 'bg-amber-600 hover:bg-amber-500' : 'bg-gray-600 hover:bg-opacity-80'}`}
        >
          {isScreenSharing ? <FaStop size={20} /> : <FaShare size={20} />}
        </button>
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-3 rounded-full bg-gray-600 hover:bg-opacity-80 transition"
        >
          <FaComment size={20} />
        </button>
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition"
        >
          <FaPhoneSlash size={20} />
        </button>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed right-4 top-4 bottom-24 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center shrink-0">
            <h3 className="font-semibold">Chat</h3>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Close chat"
            >
              <FaTimes size={18} />
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <span className="font-semibold">{msg.sender}:</span> {msg.text}
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex">
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
              className="flex-1 border rounded-l px-2 py-1"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Video = ({ stream }) => {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    const play = () => {
      el.play().catch(() => {});
    };
    play();
    stream.addEventListener("addtrack", play);
    return () => stream.removeEventListener("addtrack", play);
  }, [stream]);

  return (
    <div className="relative min-h-[200px] bg-black rounded-lg">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full min-h-[200px] object-contain rounded-lg border-2 border-green-500"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        Doctor
      </div>
    </div>
  );
};

export default VideoCall;