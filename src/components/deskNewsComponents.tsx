/**
 * DeskNews Standardized Components
 * Componentes reutilizáveis com design padronizado
 * Master Control TV Theme
 */

import React from "react";
import {
  COLORS,
  BUTTON_CLASSES,
  LABEL_CLASSES,
  INPUT_CLASSES,
  CARD_CLASSES,
  CONTAINER_CLASSES,
  MODAL_CLASSES,
  LAYOUT_CLASSES,
  BLOCK_CLASSES,
  cn,
  FOCUS_CLASSES,
  BORDER_LEFT_ACCENT,
  TRANSITIONS,
} from "./designSystem";

// ========================================
// LABEL COMPONENT
// ========================================
interface LabelProps {
  children: React.ReactNode;
  secondary?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, secondary }) => (
  <label className={secondary ? LABEL_CLASSES.secondary : LABEL_CLASSES.base}>
    {children}
  </label>
);

// ========================================
// INPUT COMPONENT
// ========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  size?: "small" | "base" | "large";
}

export const Input: React.FC<InputProps> = ({ label, error, size = "base", ...props }) => {
  const sizeClass = size === "small" ? INPUT_CLASSES.small : size === "large" ? "px-4 py-3 text-base" : "";

  return (
    <div className="mb-3">
      {label && <Label>{label}</Label>}
      <input
        {...props}
        className={cn(
          INPUT_CLASSES.base,
          sizeClass,
          error && INPUT_CLASSES.error,
          props.className
        )}
      />
      {error && <p className="text-red-400 text-xs mt-1 font-mono">{error}</p>}
    </div>
  );
};

// ========================================
// TEXTAREA COMPONENT
// ========================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, ...props }) => (
  <div className="mb-3">
    {label && <Label>{label}</Label>}
    <textarea
      {...props}
      className={cn(
        INPUT_CLASSES.base,
        "resize-vertical min-h-[100px]",
        error && INPUT_CLASSES.error,
        props.className
      )}
    />
    {error && <p className="text-red-400 text-xs mt-1 font-mono">{error}</p>}
  </div>
);

// ========================================
// SELECT COMPONENT
// ========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, ...props }) => (
  <div className="mb-3">
    {label && <Label>{label}</Label>}
    <select
      {...props}
      className={cn(
        INPUT_CLASSES.base,
        "appearance-none cursor-pointer",
        error && INPUT_CLASSES.error,
        props.className
      )}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-400 text-xs mt-1 font-mono">{error}</p>}
  </div>
);

// ========================================
// BUTTON COMPONENT
// ========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "success";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className,
  ...props
}) => {
  const variantClass = {
    primary: BUTTON_CLASSES.primary,
    secondary: BUTTON_CLASSES.secondary,
    tertiary: BUTTON_CLASSES.tertiary,
    ghost: BUTTON_CLASSES.ghost,
    danger: BUTTON_CLASSES.danger,
    success: BUTTON_CLASSES.success,
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-all",
        variantClass,
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? "⏳" : icon}
      {children}
    </button>
  );
};

// ========================================
// CARD COMPONENT
// ========================================
interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "base" | "elevated" | "interactive";
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  variant = "base",
  padding = "md",
  onClick,
  className,
}) => {
  const variantClass = {
    base: CARD_CLASSES.base,
    elevated: CARD_CLASSES.elevated,
    interactive: CARD_CLASSES.interactive,
  }[variant];

  const paddingClass =
    padding === "sm" ? "p-3" : padding === "lg" ? "p-6" : "p-4";

  return (
    <div
      onClick={onClick}
      className={cn(
        variantClass,
        paddingClass,
        onClick && "cursor-pointer",
        className
      )}
    >
      {header && <div className={CARD_CLASSES.header}>{header}</div>}
      <div>{children}</div>
      {footer && <div className="border-t border-white/8 pt-4 mt-4">{footer}</div>}
    </div>
  );
};

// ========================================
// BLOCK COMPONENT (Seção numerada)
// ========================================
interface BlockProps {
  number: string | number;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const Block: React.FC<BlockProps> = ({ number, title, children, action }) => (
  <div className={BLOCK_CLASSES.container}>
    <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-[#22c55e] to-transparent opacity-70" />
    <div className={BLOCK_CLASSES.header}>
      <div className="flex items-center gap-2.5">
        <span className={BLOCK_CLASSES.number}>{number}</span>
        <div className={BLOCK_CLASSES.title}>{title}</div>
      </div>
      {action}
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

// ========================================
// MODAL/DIALOG COMPONENT
// ========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "small" | "medium" | "large";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "medium",
}) => {
  if (!isOpen) return null;

  const sizeClass =
    size === "small"
      ? "max-w-lg"
      : size === "large"
        ? "max-w-4xl"
        : "max-w-2xl";

  return (
    <div className={MODAL_CLASSES.backdrop} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(MODAL_CLASSES.container, sizeClass)}
      >
        {(title || subtitle) && (
          <div className={MODAL_CLASSES.header}>
            <div>
              {subtitle && (
                <p className="text-xs text-[#22c55e] font-mono uppercase tracking-widest mb-1">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-white">
                  {title}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={CARD_CLASSES.body}>{children}</div>
        {footer && <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  );
};

// ========================================
// HEADER COMPONENT (Page Header)
// ========================================
interface HeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ icon, title, subtitle, children }) => (
  <div className={cn(CONTAINER_CLASSES.section, "border-b border-white/8 bg-[#0f1117]/95 backdrop-blur-sm sticky top-0 z-40")}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-mono font-bold uppercase tracking-[.25em] text-sm text-white leading-none">
            {title}
          </h1>
          {subtitle && (
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  </div>
);

// ========================================
// TAB BAR COMPONENT
// ========================================
interface TabBarProps {
  tabs: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => (
  <nav className={LAYOUT_CLASSES.tabBar}>
    {tabs.map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => onTabChange(key)}
        className={cn(
          LAYOUT_CLASSES.tabButton,
          activeTab === key
            ? LAYOUT_CLASSES.tabButtonActive
            : LAYOUT_CLASSES.tabButtonInactive
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="hidden sm:inline">{label}</span>
      </button>
    ))}
  </nav>
);

// ========================================
// STAT CARD COMPONENT
// ========================================
interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend = "neutral",
  icon,
}) => (
  <Card variant="elevated" padding="md">
    <div className="flex items-start justify-between">
      <div>
        <Label secondary>{label}</Label>
        <div className="text-2xl font-bold text-[#22c55e] mt-2">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs mt-2 font-mono",
              trend === "up" && "text-green-400",
              trend === "down" && "text-red-400",
              trend === "neutral" && "text-white/50"
            )}
          >
            {trend === "up" && "↑"} {trend === "down" && "↓"} {change}
          </p>
        )}
      </div>
      {icon && <div className="text-[#22c55e] opacity-50">{icon}</div>}
    </div>
  </Card>
);

// ========================================
// ALERT COMPONENT
// ========================================
interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = "info", title, children, onClose }) => {
  const colorMap = {
    info: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", icon: "ℹ️" },
    success: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", icon: "✅" },
    warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", icon: "⚠️" },
    error: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: "❌" },
  };

  const colors = colorMap[type];

  return (
    <div className={cn("rounded-md border p-4 mb-4", colors.bg, colors.border)}>
      <div className="flex gap-3">
        <span className="text-lg shrink-0">{colors.icon}</span>
        <div className="flex-1">
          {title && <h4 className={cn("font-bold text-sm", colors.text)}>{title}</h4>}
          <p className={cn("text-sm", colors.text)}>{children}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn("font-bold text-lg hover:opacity-75 transition-opacity", colors.text)}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================
// EMPTY STATE COMPONENT
// ========================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="text-center py-12">
    {icon && <div className="text-4xl mb-4 opacity-50">{icon}</div>}
    <h3 className="font-bold text-white mb-2">{title}</h3>
    {description && <p className="text-white/50 text-sm mb-4">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

// ========================================
// BADGE COMPONENT
// ========================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", size = "sm" }) => {
  const variantClass = {
    default: "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40",
    success: "bg-green-500/20 text-green-400 border border-green-500/40",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40",
    error: "bg-red-500/20 text-red-400 border border-red-500/40",
    info: "bg-blue-500/20 text-blue-400 border border-blue-500/40",
  };

  const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span className={cn("rounded-md font-mono font-bold inline-block", variantClass[variant], sizeClass)}>
      {children}
    </span>
  );
};
