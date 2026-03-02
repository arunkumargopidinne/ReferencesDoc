import { CSSProperties } from 'react';
import { theme, keyframes } from './theme';

// Reusable style objects for components
export const styles = {
  // Containers/Layouts
  page: {
    padding: '2rem',
    color: theme.colors.text,
    minHeight: '100vh',
  } as CSSProperties,

  main: {
    display: 'flex',
    gap: '1.5rem',
    padding: '2rem',
    minHeight: '100vh',
  } as CSSProperties,

  // Cards
  card: {
    background: theme.glass.light,
    backdropFilter: 'blur(6px) saturate(1.08)',
    borderRadius: theme.radius,
    padding: '1rem',
    boxShadow: theme.shadows.card,
    transition: `transform ${theme.transitions.medium} ease, box-shadow ${theme.transitions.medium} ease`,
  } as CSSProperties,

  cardHover: {
    transform: 'translateY(-6px)',
    boxShadow: theme.shadows.cardHover,
  } as CSSProperties,

  // Buttons
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: `transform ${theme.transitions.fast} ease, box-shadow ${theme.transitions.fast} ease`,
    border: 'none',
    fontSize: '0.95rem',
  } as CSSProperties,

  btnPrimary: {
    background: theme.gradients.btnPrimary,
    color: theme.colors.cream,
    boxShadow: theme.shadows.btnPrimary,
  } as CSSProperties,

  btnPrimaryHover: {
    transform: 'translateY(-3px) scale(1.01)',
    boxShadow: theme.shadows.btnPrimaryHover,
  } as CSSProperties,

  btnGhost: {
    background: 'transparent',
    color: theme.colors.text,
    border: `1px solid rgba(0,0,0,0.06)`,
    transition: `transform ${theme.transitions.fast} ease`,
  } as CSSProperties,

  btnGhostHover: {
    transform: 'translateY(-2px)',
  } as CSSProperties,

  btnNotion: {
    background: theme.gradients.btnNotion,
    color: theme.colors.maroon,
    boxShadow: theme.shadows.btnNotion,
    textDecoration: 'none',
  } as CSSProperties,

  // Loading states
  loader: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: `4px solid ${theme.colors.cream}`,
    borderTopColor: theme.colors.maroon,
    animation: 'spin 900ms linear infinite',
  } as CSSProperties,

  // Pulse ring
  pulseRing: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: theme.colors.maroon,
    boxShadow: `0 0 0 0 rgba(91,14,20,0.4)`,
    animation: 'pulse 1.6s infinite ease-out',
  } as CSSProperties,

  // Generating indicator
  generating: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
  } as CSSProperties,

  // Sidebar
  sidebar: {
    width: '256px',
    background: theme.gradients.sidebarActive,
    borderRight: `1px solid rgba(0,0,0,0.04)`,
    padding: '1rem',
    borderRadius: theme.radius,
  } as CSSProperties,

  // Forms
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  } as CSSProperties,

  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.colors.text,
  } as CSSProperties,

  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '6px',
    border: `1px solid rgba(0,0,0,0.1)`,
    fontSize: '0.95rem',
    transition: `box-shadow ${theme.transitions.fast} ease`,
  } as CSSProperties,

  inputFocus: {
    outline: 'none',
    boxShadow: `0 0 0 3px rgba(91, 14, 20, 0.1)`,
  } as CSSProperties,

  // Skeleton/Shimmer
  skeleton: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.06))',
  } as CSSProperties,

  // Headings
  h1: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: '1rem',
  } as CSSProperties,

  h2: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.colors.text,
    marginBottom: '1rem',
  } as CSSProperties,

  h3: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.text,
    marginBottom: '0.75rem',
  } as CSSProperties,

  // Utilities
  errorText: {
    color: theme.colors.error,
    fontSize: '0.875rem',
  } as CSSProperties,

  successText: {
    color: theme.colors.success,
    fontSize: '0.875rem',
  } as CSSProperties,

  spacer: (size: keyof typeof theme.spacing = 'md') => ({
    marginBottom: theme.spacing[size],
  } as CSSProperties),

  gap: (size: keyof typeof theme.spacing = 'md') => ({
    gap: theme.spacing[size],
  } as CSSProperties),
};

// CSS in JS helper for animations
export const getAnimationStyle = () => `
  ${keyframes.spin}
  ${keyframes.pulse}
  ${keyframes.dots}
  ${keyframes.shimmer}
`;
