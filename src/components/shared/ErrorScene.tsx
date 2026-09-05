"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Cog,
  Sun,
  Moon,
  ArrowLeft,
  Home,
  RotateCw,
  AlertTriangle,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";

export interface ErrorSceneAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ErrorSceneProps {
  code?: string;
  title: string;
  message: string;
  primaryAction: ErrorSceneAction;
  secondaryAction?: ErrorSceneAction;
}

export function ErrorScene({
  code = "500",
  title,
  message,
  primaryAction,
  secondaryAction,
}: ErrorSceneProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const shadow = dark
    ? "0 8px 40px rgba(0,0,0,0.4)"
    : "0 8px 40px rgba(20,22,26,0.08)";

  const badgeIcon =
    code === "404" ? (
      <SlidersHorizontal size={13} color="var(--lime)" />
    ) : code === "403" || code === "401" ? (
      <ShieldAlert size={13} color="var(--lime)" />
    ) : (
      <AlertTriangle size={13} color="var(--lime)" />
    );

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      {/* Embedded Hardware-Accelerated Micro-Animations (3-6s loops, respecting reduced motion) */}
      <style>{`
        @keyframes gear-rotate-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gear-rotate-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes wrench-pendulum {
          0%, 100% { transform: rotate(-18deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes smoke-drift-1 {
          0% { transform: translate3d(0, 0, 0) scale(0.6); opacity: 0; }
          25% { opacity: 0.55; }
          75% { opacity: 0.25; }
          100% { transform: translate3d(-14px, -32px, 0) scale(1.3); opacity: 0; }
        }
        @keyframes smoke-drift-2 {
          0% { transform: translate3d(0, 0, 0) scale(0.5); opacity: 0; }
          30% { opacity: 0.5; }
          80% { opacity: 0.2; }
          100% { transform: translate3d(16px, -38px, 0) scale(1.4); opacity: 0; }
        }
        @keyframes smoke-drift-3 {
          0% { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
          35% { opacity: 0.65; }
          85% { opacity: 0.3; }
          100% { transform: translate3d(4px, -44px, 0) scale(1.5); opacity: 0; }
        }
        @keyframes lift-hydraulic-bob {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -4px, 0); }
        }
        @keyframes pulse-diagnostic-light {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .anim-gear-cw {
          animation: gear-rotate-cw 6s linear infinite;
          transform-origin: center;
          will-change: transform;
        }
        .anim-gear-ccw {
          animation: gear-rotate-ccw 4.5s linear infinite;
          transform-origin: center;
          will-change: transform;
        }
        .anim-wrench {
          animation: wrench-pendulum 3.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          transform-origin: 20% 20%;
          will-change: transform;
        }
        .anim-smoke-1 {
          animation: smoke-drift-1 3.4s ease-out infinite;
          will-change: transform, opacity;
        }
        .anim-smoke-2 {
          animation: smoke-drift-2 4.1s ease-out 0.8s infinite;
          will-change: transform, opacity;
        }
        .anim-smoke-3 {
          animation: smoke-drift-3 3.8s ease-out 1.6s infinite;
          will-change: transform, opacity;
        }
        .anim-lift-car {
          animation: lift-hydraulic-bob 4.5s ease-in-out infinite;
          will-change: transform;
        }
        .anim-light-pulse {
          animation: pulse-diagnostic-light 2s ease-in-out infinite;
          will-change: opacity, transform;
        }
        .interactive-btn {
          transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), opacity 160ms ease, background-color 160ms ease;
        }
        .interactive-btn:active {
          transform: scale(0.97);
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-gear-cw,
          .anim-gear-ccw,
          .anim-wrench,
          .anim-smoke-1,
          .anim-smoke-2,
          .anim-smoke-3,
          .anim-lift-car,
          .anim-light-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* Theme toggle — top right */}
      <button
        id="btn-error-theme"
        onClick={toggleTheme}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center interactive-btn"
        style={{
          background: "var(--card)",
          boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
          zIndex: 20,
          border: "1px solid var(--border)",
        }}
      >
        {dark ? (
          <Sun size={16} color="var(--lime)" />
        ) : (
          <Moon size={16} color="var(--ink)" />
        )}
      </button>

      {/* Main Error Card */}
      <div
        className="relative rounded-3xl p-6 sm:p-10 w-full max-w-lg mx-auto flex flex-col items-center text-center border"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: shadow,
          zIndex: 10,
        }}
      >
        {/* Status Pill Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4"
          style={{
            background: "var(--ink-2)",
            color: "var(--lime)",
          }}
        >
          {badgeIcon}
          <span className="font-mono text-xs font-semibold tracking-wider">
            WORKSHOP STATUS // {code}
          </span>
        </div>

        {/* Animated Big Error Code with Embedded Mechanical Elements */}
        <div className="relative flex items-center justify-center select-none py-2">
          {/* Drifting smoke puffs rising from behind digits */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none w-24 h-16">
            <span
              className="anim-smoke-1 absolute left-4 bottom-2 w-4 h-4 rounded-full"
              style={{ background: "var(--slate)" }}
            />
            <span
              className="anim-smoke-2 absolute right-5 bottom-3 w-5 h-5 rounded-full"
              style={{ background: "var(--slate)" }}
            />
            <span
              className="anim-smoke-3 absolute left-10 bottom-1 w-3.5 h-3.5 rounded-full"
              style={{ background: "var(--slate)" }}
            />
          </div>

          {/* Large Oswald Digits */}
          <h1
            className="font-oswald text-8xl sm:text-9xl font-bold tracking-tighter leading-none relative z-10"
            style={{
              color: "var(--ink)",
              textShadow: dark
                ? "0 4px 24px rgba(0,0,0,0.5)"
                : "0 4px 20px rgba(20,22,26,0.06)",
            }}
          >
            {code}
          </h1>

          {/* Rotating Gears Ornament */}
          <div
            className="absolute -top-1 -right-3 sm:-right-6 w-9 h-9 rounded-full flex items-center justify-center anim-gear-cw"
            style={{
              color: "var(--lime)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            }}
            aria-hidden="true"
          >
            <Cog size={30} strokeWidth={1.75} />
          </div>

          <div
            className="absolute -bottom-1 -left-3 sm:-left-5 w-7 h-7 rounded-full flex items-center justify-center anim-gear-ccw"
            style={{
              color: "var(--slate)",
              opacity: 0.7,
            }}
            aria-hidden="true"
          >
            <Cog size={22} strokeWidth={2} />
          </div>

          {/* Swinging Wrench Ornament */}
          <div
            className="absolute top-2 -left-4 sm:-left-6 anim-wrench"
            style={{ color: "var(--lime)" }}
            aria-hidden="true"
          >
            <Wrench size={26} strokeWidth={2} />
          </div>
        </div>

        {/* Illustrated Car on Hydraulic Lift Scene (Line Art) */}
        <div className="w-full my-4 flex justify-center items-center py-2" aria-hidden="true">
          <svg
            className="w-full max-w-[320px] h-32 text-current overflow-visible"
            viewBox="0 0 320 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Workshop floor grid line */}
            <line
              x1="10"
              y1="120"
              x2="310"
              y2="120"
              stroke="var(--border)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Floor hatch markers */}
            <line x1="40" y1="120" x2="35" y2="126" stroke="var(--slate)" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="80" y1="120" x2="75" y2="126" stroke="var(--slate)" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="120" y1="120" x2="115" y2="126" stroke="var(--slate)" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="160" y1="120" x2="155" y2="126" stroke="var(--slate)" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="200" y1="120" x2="195" y2="126" stroke="var(--slate)" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="240" y1="120" x2="235" y2="126" stroke="var(--slate)" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="280" y1="120" x2="275" y2="126" stroke="var(--slate)" strokeWidth="1.5" strokeOpacity="0.4" />

            {/* Left Lift Post */}
            <rect x="36" y="24" width="14" height="96" rx="2" stroke="var(--ink)" strokeWidth="2" fill="var(--chip)" />
            <line x1="43" y1="30" x2="43" y2="114" stroke="var(--slate)" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Left Lift Column Foot */}
            <rect x="30" y="116" width="26" height="5" rx="1.5" fill="var(--ink)" />

            {/* Right Lift Post */}
            <rect x="270" y="24" width="14" height="96" rx="2" stroke="var(--ink)" strokeWidth="2" fill="var(--chip)" />
            <line x1="277" y1="30" x2="277" y2="114" stroke="var(--slate)" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Right Lift Column Foot */}
            <rect x="264" y="116" width="26" height="5" rx="1.5" fill="var(--ink)" />

            {/* Hydraulic Lift Carriage & Cross Arms */}
            <g className="anim-lift-car">
              {/* Left Lift Arm */}
              <path
                d="M48 64 L110 64 L120 72"
                stroke="var(--lime)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Lift Arm */}
              <path
                d="M272 64 L210 64 L200 72"
                stroke="var(--lime)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Raised Vehicle Silhouette */}
              <g transform="translate(68, 22)">
                {/* Open Hood Line Art */}
                <path
                  d="M14 26 L4 12"
                  stroke="var(--lime)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M4 12 L22 10"
                  stroke="var(--lime)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Engine bay steam indicator */}
                <circle cx="16" cy="18" r="2.5" fill="var(--slate)" opacity="0.6" />
                <circle cx="24" cy="14" r="3.5" fill="var(--slate)" opacity="0.4" />

                {/* Car Roof & Body */}
                <path
                  d="M22 26 L52 26 L76 10 L134 10 L156 26 L176 26 C181 26 184 30 184 35 L184 44 L0 44 L0 35 C0 30 4 26 10 26 Z"
                  stroke="var(--ink)"
                  strokeWidth="2.5"
                  fill="var(--card)"
                  strokeLinejoin="round"
                />

                {/* Windows */}
                <path
                  d="M58 24 L78 13 L108 13 L108 24 Z"
                  stroke="var(--slate)"
                  strokeWidth="1.5"
                  fill="var(--chip)"
                  strokeLinejoin="round"
                />
                <path
                  d="M114 24 L114 13 L130 13 L146 24 Z"
                  stroke="var(--slate)"
                  strokeWidth="1.5"
                  fill="var(--chip)"
                  strokeLinejoin="round"
                />

                {/* Door line & handle */}
                <line x1="110" y1="24" x2="110" y2="44" stroke="var(--border)" strokeWidth="1.5" />
                <rect x="94" y="28" width="10" height="2" rx="1" fill="var(--ink)" />

                {/* Wheels & Tires */}
                <circle cx="38" cy="44" r="13" stroke="var(--ink)" strokeWidth="2.5" fill="var(--chip)" />
                <circle cx="38" cy="44" r="6" stroke="var(--lime)" strokeWidth="2" fill="var(--ink)" />

                <circle cx="148" cy="44" r="13" stroke="var(--ink)" strokeWidth="2.5" fill="var(--chip)" />
                <circle cx="148" cy="44" r="6" stroke="var(--lime)" strokeWidth="2" fill="var(--ink)" />

                {/* Headlight & Taillight */}
                <circle cx="4" cy="33" r="2.5" fill="var(--lime)" />
                <rect x="180" y="31" width="3" height="5" rx="1" fill="#EF4444" />
              </g>
            </g>

            {/* Diagnostic light on lift post */}
            <circle cx="43" cy="44" r="3" fill="var(--lime)" className="anim-light-pulse" />
          </svg>
        </div>

        {/* Title & Copy */}
        <h2
          className="font-oswald text-2xl sm:text-3xl font-semibold mb-2"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </h2>
        <p
          className="font-inter text-xs sm:text-sm max-w-sm mb-6 leading-relaxed"
          style={{ color: "var(--slate)" }}
        >
          {message}
        </p>

        {/* Actions Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          {/* Primary Action Button */}
          {primaryAction.href ? (
            <Link
              id="btn-error-primary"
              href={primaryAction.href}
              className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-inter text-sm font-semibold interactive-btn"
              style={{
                background: "var(--lime)",
                color: "var(--ink-2)",
              }}
            >
              <Home size={15} />
              {primaryAction.label}
            </Link>
          ) : (
            <button
              id="btn-error-primary"
              type="button"
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-inter text-sm font-semibold interactive-btn"
              style={{
                background: "var(--lime)",
                color: "var(--ink-2)",
              }}
            >
              <Home size={15} />
              {primaryAction.label}
            </button>
          )}

          {/* Optional Secondary Action Button */}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                id="btn-error-secondary"
                href={secondaryAction.href}
                className="w-full sm:w-auto min-w-[130px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-inter text-sm font-semibold border interactive-btn"
                style={{
                  background: "var(--chip)",
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                }}
              >
                <ArrowLeft size={15} />
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                id="btn-error-secondary"
                type="button"
                onClick={secondaryAction.onClick || (() => router.back())}
                className="w-full sm:w-auto min-w-[130px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-inter text-sm font-semibold border interactive-btn"
                style={{
                  background: "var(--chip)",
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                }}
              >
                {secondaryAction.onClick ? <RotateCw size={15} /> : <ArrowLeft size={15} />}
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}