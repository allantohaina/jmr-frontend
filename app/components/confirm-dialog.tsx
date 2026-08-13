"use client";

import React, { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const CONFIRM_STYLES = `
.jmr-confirm-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(11,17,26,0.8);backdrop-filter:blur(4px);padding:16px;}
.jmr-confirm{width:100%;max-width:420px;background:var(--card,#25303a);border:1px solid var(--card-border,rgba(229,173,70,0.12));border-radius:12px;padding:26px;box-shadow:0 24px 60px rgba(0,0,0,0.4);}
.jmr-confirm-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
.jmr-confirm-icon svg{width:20px;height:20px;}
.jmr-confirm-icon.danger{background:rgba(224,82,82,0.1);color:#e05252;}
.jmr-confirm-icon.primary{background:rgba(229,173,70,0.1);color:var(--gold,#e5ad46);}
.jmr-confirm h3{font-family:var(--font-serif,'Fraunces',serif);font-weight:500;font-size:20px;color:var(--gold-light,#eccc90);margin:0 0 8px;}
.jmr-confirm p{font-size:13px;color:var(--text-muted,rgba(229,173,70,0.6));line-height:1.6;margin:0 0 22px;}
.jmr-confirm-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;}
.jmr-confirm-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:8px;border:none;font-weight:700;font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:filter .2s,opacity .2s;}
.jmr-confirm-btn:disabled{opacity:0.6;cursor:not-allowed;}
.jmr-confirm-btn.cancel{background:transparent;border:1px solid var(--card-border,rgba(229,173,70,0.12));color:var(--text-muted,rgba(229,173,70,0.6));}
.jmr-confirm-btn.cancel:hover{border-color:var(--gold,#e5ad46);color:var(--gold-light,#eccc90);}
.jmr-confirm-btn.danger{background:linear-gradient(180deg,#e05252,#c13b3b);color:#fff;}
.jmr-confirm-btn.danger:hover{filter:brightness(1.08);}
.jmr-confirm-btn.primary{background:linear-gradient(180deg,var(--gold-light,#eccc90),var(--gold,#e5ad46));color:#1a1204;}
.jmr-confirm-btn.primary:hover{filter:brightness(1.06);}
.jmr-confirm-spinner{width:12px;height:12px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:jmr-spin .7s linear infinite;}
@keyframes jmr-spin{to{transform:rotate(360deg);}}
`;

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="jmr-confirm-overlay" role="presentation" onClick={() => { if (!loading) onCancel(); }}>
      <div className="jmr-confirm" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <style>{CONFIRM_STYLES}</style>
        <div className={`jmr-confirm-icon ${tone}`}>
          {tone === "danger" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8V13M12 16H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
          )}
        </div>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="jmr-confirm-actions">
          <button className="jmr-confirm-btn cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className={`jmr-confirm-btn ${tone}`} onClick={onConfirm} disabled={loading}>
            {loading && <span className="jmr-confirm-spinner" />}
            {loading ? "En cours…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}