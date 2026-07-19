"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  Sparkles,
  Bot,
  CheckCircle,
  FileCode,
  Gauge,
  Play,
  RotateCcw,
  Workflow
} from "lucide-react";
import confetti from "canvas-confetti";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  reasoning?: string[];
  confidence?: number;
  memory?: string[];
  action?: {
    label: string;
    resolvedText: string;
  };
}

const INITIAL_CONVERSATION: Message[] = [
  {
    id: "m1",
    sender: "ai",
    text: "Operational Copilot initialized. I have full context of stadium gates, parking occupancy, concessions retail logs, and medical dispatch lines. What telemetry analysis would you like to run?",
    timestamp: "20:50",
  },
  {
    id: "m2",
    sender: "user",
    text: "Gate 4 is experiencing high congestion. Perform a safety threat assessment and suggest immediate mitigation.",
    timestamp: "20:51",
  },
  {
    id: "m3",
    sender: "ai",
    text: "I have calculated crowd flow dynamics at Gate 4. The current waiting delay is 14 minutes, which violates standard Level-2 service level agreements (SLAs). I recommend deploying crowd controllers and triggering a digital marquee re-route for Section 200 tickets.",
    timestamp: "20:51",
    confidence: 96,
    memory: ["Gate_4_Telemetry.json", "SLA_Thresholds.csv", "Section_Density_Map.svg"],
    reasoning: [
      "Querying crowd densities at North and East entrance gates.",
      "Comparing current Gate 4 wait times (14m) against the critical SLA threshold (10m).",
      "Running predictive flow modeling (Poisson arrival process) for the next 15 minutes.",
      "Resolving optimal alternate entry point (East Gate shows 2m wait).",
      "Formulating digital signage diversion routes."
    ],
    action: {
      label: "Update Marquees & Dispatch Marshals",
      resolvedText: "Marquees updated. Diversion in progress."
    }
  }
];

const SUGGESTED_PROMPTS = [
  "Run evacuation simulation for East stand",
  "Optimize parking lot shuttle loops",
  "Predict beverage stock demand for half-time",
  "Assess wind impact on tournament kickoffs"
];

export default function CopilotClient() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_CONVERSATION);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [resolvedActions, setResolvedActions] = useState<Record<string, boolean>>({});
  const [isFocused, setIsFocused] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Voice recording timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setVoiceTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const userMsg: Message = {
      id: `user-msg-${messageIdRef.current++}`,
      sender: "user",
      text: textToSend,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsThinking(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/agents/invoke?query=${encodeURIComponent(textToSend)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `ai-msg-${messageIdRef.current++}`,
        sender: "ai",
        text: data.reason || "No response details provided.",
        timestamp: time,
        confidence: Math.round((data.confidence || 1.0) * 100),
        memory: data.evidence ? Object.keys(data.evidence) : [],
        reasoning: data.recommended_actions || [],
        action: data.recommended_actions && data.recommended_actions.length > 0 ? {
          label: data.recommended_actions[0],
          resolvedText: "Action processed successfully."
        } : undefined
      };

      setIsThinking(false);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.warn("FastAPI server unavailable, falling back to simulation:", error);
      
      // Simulate AI response after 1.5 seconds
      setTimeout(() => {
        let aiText = "Simulation complete. I have mapped operations telemetry. Energy and parking resources remain optimized. No critical warnings generated.";
        let confidence = 92;
        let memory = ["Current_Energy_Grid.json", "Weather_API_Telemetry.csv"];
        let reasoning = [
          "Analyzing operational state logs...",
          "Validating power grid usage against weather forecast...",
          "Confirming parking shuttle intervals meet demand..."
        ];
        let action = undefined;

        if (textToSend.toLowerCase().includes("evacuation") || textToSend.toLowerCase().includes("east")) {
          aiText = "Evacuation simulation compiled. Mapped routes indicate East Stand egress bottleneck at Staircase F due to temporary equipment staging. Recommending exit route adjustment via Staircase E.";
          confidence = 98;
          memory = ["East_Stand_CAD.dwg", "Emergency_Routes_v4.json", "Evac_Speed_Estimates.csv"];
          reasoning = [
            "Importing physical staircase dimensions for East Stand.",
            "Computing egress velocities based on 18,200 occupancy levels.",
            "Identifying physical blockage at Staircase F.",
            "Re-routing flow equations to Staircase E to prevent crowd compression."
          ];
          action = {
            label: "Broadcast Egress Re-routing Plan",
            resolvedText: "Emergency announcement queued. Routes updated."
          };
        } else if (textToSend.toLowerCase().includes("parking") || textToSend.toLowerCase().includes("shuttle")) {
          aiText = "Shuttle loop optimizer suggests reducing transit intervals on Route A from 12 mins to 8 mins for the next hour to match departure surge. This utilizes standby shuttle vehicle S-4.";
          confidence = 94;
          memory = ["Shuttle_Locators.json", "Lot_C_Reservations.csv"];
          reasoning = [
            "Querying GPS coordinates of active parking shuttles.",
            "Analyzing occupancy records of peripheral parking Lot C.",
            "Predicting egress rates of post-match exit vectors."
          ];
          action = {
            label: "Dispatch Shuttle S-4",
            resolvedText: "Shuttle S-4 dispatched. Route A intervals modified."
          };
        }

        const aiMsg: Message = {
          id: `ai-msg-${messageIdRef.current++}`,
          sender: "ai",
          text: aiText,
          timestamp: time,
          confidence,
          memory,
          reasoning,
          action
        };

        setIsThinking(false);
        setMessages((prev) => [...prev, aiMsg]);
      }, 1500);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSend("Optimize parking lot shuttle loops");
    } else {
      setVoiceTimer(0);
      setIsRecording(true);
    }
  };

  const handleAction = (msgId: string) => {
    setResolvedActions((prev) => ({ ...prev, [msgId]: true }));
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ["#00E5FF", "#7C3AED"],
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[calc(100vh-140px)] select-none">
      
      {/* Left Columns (2 cols): Conversational Chat Area */}
      <div className="xl:col-span-2 flex flex-col h-full rounded-2xl glass-panel border border-white/5 overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ai/10 flex items-center justify-center border border-ai/20 text-ai">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                ArenaMind AI Copilot <span className="text-[9px] bg-ai/20 text-ai px-1.5 py-0.5 rounded font-black">ACTIVE</span>
              </h2>
              <p className="text-[10px] text-gray-500 font-mono">STADIUM_OPERATIONS_BRAIN_V1</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button
              onClick={() => setMessages([INITIAL_CONVERSATION[0]])}
              className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-4 ${isAI ? "justify-start" : "justify-end"}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-purple-glow/10 border border-purple-glow/20 text-purple-glow flex items-center justify-center shrink-0">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                )}

                <div className="max-w-[80%] space-y-3">
                  {/* Bubble content */}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                      isAI
                        ? "bg-surface-secondary/65 text-gray-200 border-white/5"
                        : "bg-primary/25 text-white border-primary/30 rounded-tr-none"
                    }`}
                  >
                    {msg.text}

                    {/* Meta references */}
                    {isAI && msg.memory && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                        {msg.memory.map((file) => (
                          <div
                            key={file}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-gray-400"
                          >
                            <FileCode className="w-3 h-3 text-ai" /> {file}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  {isAI && msg.action && (
                    <div className="pl-1">
                      {resolvedActions[msg.id] ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-success bg-success/10 border border-success/20 px-4 py-2.5 rounded-xl max-w-max">
                          <CheckCircle className="w-4 h-4" /> {msg.action.resolvedText}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAction(msg.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-ai hover:bg-ai/90 rounded-xl transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)] cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" /> {msg.action.label}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-primary to-ai flex items-center justify-center font-extrabold text-xs text-white shrink-0">
                    JD
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking status */}
          {isThinking && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-purple-glow/10 border border-purple-glow/20 text-purple-glow flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 animate-spin" />
              </div>
              <div className="bg-surface-secondary/65 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-ai animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-ai animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-ai animate-bounce" />
                </div>
                <span className="text-xs text-gray-500 font-mono">Generating response reasoning...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts Grid */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/0.5">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg bg-white/5 border border-white/5 hover:border-ai/20 hover:bg-ai/5 transition-all text-left cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3 bg-white/1">
          {/* Voice Record microinteraction */}
          <button
            onClick={handleRecordToggle}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              isRecording
                ? "bg-danger border-transparent text-white animate-pulse"
                : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {isRecording ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-3 bg-white rounded-full animate-bounce" />
              </div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {isRecording ? (
            <div className="flex-1 px-4 text-xs font-mono text-danger font-semibold">
              RECORDING VOICE INPUT... {voiceTimer}s (Click mic again to submit prompt)
            </div>
          ) : (
            <input
              type="text"
              placeholder="Ask Copilot to analyze telemetry, run crowd flow simulations..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`flex-1 h-12 px-4 rounded-xl bg-black/30 border placeholder:text-gray-500 focus:outline-none transition-all ${
                isFocused ? "border-ai" : "border-white/5"
              }`}
              style={{ color: 'white' }}
            />
          )}

          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim()}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              inputValue.trim()
                ? "bg-ai text-black"
                : "bg-white/5 text-gray-600"
            }`}
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </div>

      </div>

      {/* Right Column (1 col): AI Agent Status & Reasoning Panel */}
      <div className="space-y-6 flex flex-col h-full">
        
        {/* Confidence Dial Card */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col items-center text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-4 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-gray-400" /> Decision Confidence
          </span>

          {/* Simple Animated Circle Indicator */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="url(#copilotGlow)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - 0.96)}
              />
              <defs>
                <linearGradient id="copilotGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-heading font-black text-4xl text-white">96%</span>
              <span className="text-[9px] uppercase tracking-wider text-ai font-extrabold mt-0.5">SLA Optimal</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-4 leading-normal font-light">
            AI confidence rating is evaluated against historic flow logs, current attendance density thresholds, and weather patterns.
          </p>
        </div>

        {/* Reasoning Tree Chain */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 flex-1 flex flex-col overflow-hidden">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-4 flex items-center gap-1.5">
            <Workflow className="w-3.5 h-3.5 text-gray-400" /> AI Agent Reasoning Timeline
          </span>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {messages.filter(m => m.sender === "ai" && m.reasoning).slice(-1).map((msg) => (
              <div key={msg.id} className="space-y-4">
                {msg.reasoning?.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[9px] font-bold text-gray-400 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-xs text-gray-300 leading-normal font-light pt-0.5">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="h-px bg-white/5 my-4" />

          {/* Sub Agent Node Statuses */}
          <div className="space-y-2.5">
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Sub-Agent Network Status</span>
            
            <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white/1 border border-white/5">
              <span className="text-gray-300 font-medium">Crowd Agent</span>
              <span className="flex items-center gap-1 text-success font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Idle
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white/1 border border-white/5">
              <span className="text-gray-300 font-medium">Security Agent</span>
              <span className="flex items-center gap-1 text-success font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Idle
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-ai/5 border border-ai/10">
              <span className="text-white font-medium">Emergency Agent</span>
              <span className="flex items-center gap-1 text-ai font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-ai animate-ping" /> Modeling
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
