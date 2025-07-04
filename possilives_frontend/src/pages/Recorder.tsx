import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaVideo, FaStop, FaMicrophone, FaSpinner, FaCheck, FaArrowLeft } from "react-icons/fa";
import api_ai from "../api/axiosConfigAI.ts";
import { api } from "../api/axiosConfig.ts";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { storeVideoAnalysisResults, getExistingVideoResults, combinePersonalityResults } from "../utils/personalityCombination.ts";

const Recorder = () => {
  const liveVideoFeed = useRef<HTMLVideoElement>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const ffmpeg = new FFmpeg();
  const navigate = useNavigate();

  // Timer for recording
  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(progress);
    });

    getMediaPermissions();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (liveVideoFeed.current && liveVideoFeed.current.srcObject) {
        const stream = liveVideoFeed.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);  const getMediaPermissions = async () => {
    try {
      // Try high resolution first
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user", width: 1280, height: 720 }
        });
      } catch (err) {
        console.warn("High resolution failed, trying default resolution:", err);
        // Fallback to default resolution
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user" }
        });
      }
      
      console.log("MediaStream obtained:", mediaStream);
      console.log("Video tracks:", mediaStream.getVideoTracks());
      console.log("Audio tracks:", mediaStream.getAudioTracks());
      
      setStream(mediaStream);
      setPermissionGranted(true);
      
      if (liveVideoFeed.current) {
        liveVideoFeed.current.srcObject = mediaStream;
        
        // Add event listeners for debugging
        liveVideoFeed.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          liveVideoFeed.current?.play().catch(err => {
            console.error("Error playing video:", err);
          });
        };
        
        liveVideoFeed.current.onerror = (err) => {
          console.error("Video element error:", err);
        };
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert(`Error accessing camera and microphone: ${err.message}`);
    }
  };

  const processVideo = async (videoBlob) => {
    if (!videoBlob || !(videoBlob instanceof Blob)) {
      throw new Error("Invalid video blob provided.");
    }

    setIsProcessing(true);
    await ffmpeg.load();

    const fileData = await fetchFile(videoBlob);
    await ffmpeg.writeFile("input.mp4", fileData);

    const command = ["-i", "input.mp4", "output.mp4"];

    try {
      await ffmpeg.exec(command);
    } catch (error) {
      console.error("FFmpeg execution error:", error);
    }    const data = await ffmpeg.readFile("output.mp4");
    if (!data) {
      throw new Error("Output file is undefined or not found.");
    }

    const processedVideoBlob = new Blob([data], { type: "video/mp4" });
    await uploadVideo(processedVideoBlob);
  };
  const startRecording = () => {
    if (!stream) {
      alert("Please allow access to the camera and microphone first.");
      return;
    }

    const newMediaRecorder = new MediaRecorder(stream);
    let videoChunks: Blob[] = [];
    setMediaRecorder(newMediaRecorder);
    setRecording(true);

    newMediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);
      }
    };

    newMediaRecorder.onstop = async () => {
      const videoBlob = new Blob(videoChunks, { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);

      await processVideo(videoBlob);
      navigate("/big5result");
    };

    newMediaRecorder.start();
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const uploadVideo = async (videoBlob) => {
    const formData = new FormData();
    formData.append("file", videoBlob, "recorded_video.mp4");
    
    try {
      const videoResponse = await api_ai.post("/upload/video", formData);
      if (videoResponse.status !== 200) {
        alert("Please try to speak louder and clearer");
        return;
      }
      await updatePersonalityScores(videoResponse.data);
      return videoResponse.data;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw new Error("Failed to upload video");
    }
  };
  const updatePersonalityScores = async (personalityData) => {
    try {
      const userId = localStorage.getItem("userId");
      
      // Create video analysis results
      const videoResults = {
        openness: parseInt(personalityData.Openness),
        conscientiousness: parseInt(personalityData.Conscientiousness),
        extraversion: parseInt(personalityData.Extraversion),
        agreeableness: parseInt(personalityData.Agreeableness),
        neuroticism: parseInt(personalityData.Neuroticism),
      };

      // Store video analysis results
      storeVideoAnalysisResults(videoResults);

      // Check if we have existing Big 5 results to combine with
      const existingBig5 = sessionStorage.getItem("Big5TestResult");
      if (existingBig5) {
        // We have Big 5 results, so combine them
        const big5Results = JSON.parse(existingBig5);
        const combinedResults = combinePersonalityResults(big5Results, videoResults);
        
        // Store combined results
        sessionStorage.setItem("CombinedPersonalityResult", JSON.stringify(combinedResults));
        sessionStorage.setItem("Big5Result", JSON.stringify([
          combinedResults.openness,
          combinedResults.conscientiousness,
          combinedResults.extraversion,
          combinedResults.agreeableness,
          combinedResults.neuroticism,
        ]));

        // Save combined results to backend
        await api.put(`/api/users/${userId}/personality`, {
          openness: combinedResults.openness,
          conscientiousness: combinedResults.conscientiousness,
          extraversion: combinedResults.extraversion,
          agreeableness: combinedResults.agreeableness,
          neuroticism: combinedResults.neuroticism
        });
      } else {
        // No Big 5 results, just use video analysis
        sessionStorage.setItem("Big5Result", JSON.stringify([
          personalityData.Openness,
          personalityData.Conscientiousness,
          personalityData.Extraversion,
          personalityData.Agreeableness,
          personalityData.Neuroticism,
        ]));

        // Save video results to backend
        await api.put(`/api/users/${userId}/personality`, videoResults);
      }
    } catch (error) {
      console.error("Error updating personality scores:", error);
      throw new Error("Failed to update personality scores");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">      {/* Background Video */}
      <video
        ref={liveVideoFeed}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          zIndex: 1,
          backgroundColor: '#000',  // Add fallback background
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/testbridge")}
            className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-md text-primary px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>

          <div className="text-center text-white">
            <h1 className="text-2xl font-bold">AI Personality Analysis</h1>
            <p className="text-sm opacity-80">Speak naturally for 2-3 minutes</p>
          </div>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {!recording && !isProcessing && permissionGranted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <FaVideo className="text-4xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We'll analyze your speech patterns and tone to understand your personality. 
                Speak naturally about any topic for 2-3 minutes.
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center">
                  <FaMicrophone className="text-blue-500 mr-2" />
                  Speak clearly and naturally
                </li>
                <li className="flex items-center">
                  <FaVideo className="text-blue-500 mr-2" />
                  Look at the camera occasionally  
                </li>
                <li className="flex items-center">
                  <FaCheck className="text-blue-500 mr-2" />
                  Share your thoughts freely
                </li>
              </ul>
              <motion.button
                onClick={startRecording}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Recording
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-center space-x-6">
          {/* Recording Timer */}
          {recording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500 text-primary px-4 py-2 rounded-full flex items-center space-x-2"
            >
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            </motion.div>
          )}

          {/* Main Control Button */}
          {permissionGranted && !isProcessing && (
            <motion.button
              onClick={recording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl transition-all ${
                recording 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={recording ? { 
                boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 20px rgba(239, 68, 68, 0)"] 
              } : {}}
              transition={recording ? { duration: 1.5, repeat: Infinity } : {}}
            >
              {recording ? <FaStop /> : <FaVideo />}
            </motion.button>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white bg-opacity-20 backdrop-blur-md text-primary px-6 py-4 rounded-xl text-center"
            >
              <FaSpinner className="text-2xl mx-auto mb-2 animate-spin" />
              <p className="font-semibold">Processing Video...</p>
              <p className="text-sm opacity-80">{Math.round(progress * 100)}% Complete</p>
              <div className="w-48 bg-white bg-opacity-30 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Recording Instructions */}
        {recording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white mt-4"
          >
            <p className="text-lg font-semibold mb-2">Recording in progress...</p>
            <p className="text-sm opacity-80">
              Speak naturally about any topic. Minimum 2 minutes recommended.
            </p>
          </motion.div>
        )}
      </div>

      {/* Permission Request */}
      {!permissionGranted && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <FaVideo className="text-4xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Camera & Microphone Access</h2>
            <p className="text-gray-600 mb-6">
              We need access to your camera and microphone to analyze your personality through video.
            </p>
            <motion.button
              onClick={getMediaPermissions}
              className="w-full bg-blue-600 text-primary py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Grant Access
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recorder;
