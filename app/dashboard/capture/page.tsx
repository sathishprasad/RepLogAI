"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, RotateCcw, Send, Clock, Phone, Users, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const MAX_DURATION = 90;

const meetingTypes = [
  { label: "Call", icon: Phone },
  { label: "In-person", icon: Users },
  { label: "Demo", icon: Monitor },
];

export default function CapturePage() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle");
  const [duration, setDuration] = useState(0);
  const [meetingType, setMeetingType] = useState("Call");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(40).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setState("idle");
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start(250);
      setState("recording");
      setDuration(0);
      setAudioBlob(null);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = Array.from(data).slice(0, 40).map((v) => v / 255);
        setAnalyserData(bars);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const handleReRecord = () => {
    setAudioBlob(null);
    setDuration(0);
    setAnalyserData(new Array(40).fill(0));
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    setState("processing");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("meetingType", meetingType);
      formData.append("duration", duration.toString());

      const res = await fetch("/api/voice/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.entryId) {
        router.push(`/dashboard/capture/review?id=${data.entryId}`);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setState("idle");
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const progress = (duration / MAX_DURATION) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Voice Capture</h1>
        <p className="text-muted-text mt-1">Record your meeting update — AI does the rest</p>
      </div>

      {/* Meeting Type Selector */}
      <div className="flex justify-center gap-3">
        {meetingTypes.map((type) => (
          <button
            key={type.label}
            onClick={() => setMeetingType(type.label)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
              meetingType === type.label
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-white text-muted-text border-border hover:border-primary/20"
            )}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Recording Card */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
        {/* Timer */}
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-text-primary font-mono tracking-wider">
            {formatTime(duration)}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-text">
            <Clock className="w-4 h-4" />
            {MAX_DURATION - duration}s remaining
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-bg-light rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                progress > 80 ? "bg-red-500" : progress > 50 ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Waveform */}
        <div className="flex items-end justify-center gap-[3px] h-16 mb-8">
          {analyserData.map((value, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all duration-75",
                state === "recording" ? "bg-primary" : "bg-border"
              )}
              style={{
                height: `${Math.max(4, value * 64)}px`,
                opacity: state === "recording" ? 0.4 + value * 0.6 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {state === "idle" && !audioBlob && (
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:shadow-[0_0_40px_rgba(79,124,255,0.6)] hover:scale-105"
            >
              <Mic className="w-8 h-8" />
            </button>
          )}

          {state === "recording" && (
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse"
            >
              <Square className="w-7 h-7" />
            </button>
          )}

          {state === "idle" && audioBlob && (
            <>
              <button
                onClick={handleReRecord}
                className="w-14 h-14 rounded-full bg-bg-light border border-border text-muted-text hover:text-text-primary hover:border-primary/30 flex items-center justify-center transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleSubmit}
                className="w-20 h-20 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:scale-105"
              >
                <Send className="w-7 h-7" />
              </button>
            </>
          )}

          {state === "processing" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-text">Processing your voice note...</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-primary mb-3">💡 Tips for best results</h3>
        <ul className="space-y-2 text-sm text-muted-text">
          <li>• Mention the <strong>account name</strong> and <strong>contact person</strong></li>
          <li>• State the <strong>deal stage</strong> or <strong>outcome</strong> clearly</li>
          <li>• Include any <strong>follow-up dates</strong> or <strong>next steps</strong></li>
          <li>• Speak naturally — our AI understands conversational updates</li>
        </ul>
      </div>
    </div>
  );
}
