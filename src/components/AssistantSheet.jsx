import { useEffect, useRef, useState } from "react";
import { LANGS } from "../content/langs.js";
import { UI_EN, SUGGESTION_KEYS } from "../content/ui.en.js";
import { khayaApiStatus } from "../voice/khayaPipeline.js";
import { localizedLine } from "../voice/localize.js";
import { getUiStrings } from "../voice/uiLocalize.js";
import { YELLOW, INK, shadow } from "../theme.js";
import { Ico } from "./Icons.jsx";
import { LanguagePicker } from "./LanguagePicker.jsx";
import { Zigi } from "./Zigi.jsx";

export function AssistantSheet({
  lang,
  convo,
  onSend,
  onYes,
  onNo,
  onClose,
  onSelectLang,
  listening,
  speaking,
  voicePreparing,
  onMic,
}) {
  const [text, setText] = useState("");
  const [readbackText, setReadbackText] = useState("");
  const [ui, setUi] = useState(UI_EN);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const scroller = useRef(null);
  const panelRef = useRef(null);
  const needsLang = !lang;
  const pickingLang = needsLang || showLangPicker;

  // Move focus into the dialog on open (announces it to screen readers) and
  // let Escape dismiss it.
  useEffect(() => {
    panelRef.current?.focus?.();
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!lang || lang === "en") {
      setUi(UI_EN);
      return;
    }
    let active = true;
    setUi(UI_EN);
    getUiStrings(lang)
      .then((strings) => { if (active) setUi({ ...UI_EN, ...strings }); })
      .catch(() => { if (active) setUi(UI_EN); });
    return () => { active = false; };
  }, [lang]);

  useEffect(() => {
    if (!convo.readback) {
      setReadbackText("");
      return;
    }
    let active = true;
    localizedLine(convo.readback, null, lang || "en").then((line) => {
      if (active) setReadbackText(line);
    });
    return () => { active = false; };
  }, [convo.readback, lang]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [convo.log.length, convo.readback, readbackText]);

  const submit = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  const t = (key) => ui[key] || UI_EN[key] || "";
  const langLabel = LANGS.find((l) => l.code === lang)?.label || t("pickLanguage");
  const khaya = khayaApiStatus(lang || "en");
  const status = needsLang
    ? t("chooseLanguageToStart")
    : voicePreparing
      ? t("preparingVoice")
      : speaking
        ? t("speaking")
        : listening
          ? t("listening")
          : khaya.label;
  const voiceHint = needsLang ? status : `${langLabel} · ${status}`;

  const pickLang = (code) => {
    setShowLangPicker(false);
    onSelectLang(code);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <button
        type="button"
        aria-label="Close assistant"
        onClick={onClose}
        className="btn-reset"
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", cursor: "pointer" }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("assistantTitle")}
        tabIndex={-1}
        style={{ position: "relative", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "84%", display: "flex", flexDirection: "column", boxShadow: shadow.lg, outline: "none" }}
      >
        <div style={{ background: YELLOW, borderRadius: "24px 24px 0 0", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Zigi size={40} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{t("assistantTitle")}</div>
              <div style={{ fontWeight: 600, fontSize: 13, opacity: 0.85 }}>{t("assistantSubtitle")}</div>
            </div>
          </div>
          <button type="button" className="tap btn-reset" onClick={onClose} aria-label="Close assistant" style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, cursor: "pointer" }}>✕</button>
        </div>

        {lang && !pickingLang ? (
          <button
            type="button"
            className="tap btn-reset"
            onClick={() => setShowLangPicker(true)}
            aria-label={`${langLabel}. Change language`}
            style={{
              width: "100%",
              background: "#FFF8E1",
              color: "#6b5900",
              fontSize: 11,
              fontWeight: 700,
              padding: "7px 16px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {voiceHint}
            <span style={{ marginLeft: 6, opacity: 0.7 }}>▾</span>
          </button>
        ) : (
          <div
            role="status"
            style={{ background: "#FFF8E1", color: "#6b5900", fontSize: 11, fontWeight: 700, padding: "7px 16px", textAlign: "center" }}
          >
            {voiceHint}
          </div>
        )}

        <div ref={scroller} className="hide-scrollbar" role="log" aria-live="polite" aria-label="Conversation" style={{ padding: 16, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {pickingLang ? (
            <div style={{ padding: needsLang ? "8px 4px 16px" : "4px 0 8px" }}>
              {showLangPicker && !needsLang && (
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, textAlign: "center" }}>{t("switchLanguage")}</div>
              )}
              <LanguagePicker
                compact={showLangPicker && !needsLang}
                ui={ui}
                onSelect={pickLang}
              />
            </div>
          ) : (
            <>
          {convo.log.map((m, i) => (
            <div
              key={i}
              lang={lang || "en"}
              style={{
                alignSelf: m.who === "you" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: m.who === "you" ? INK : "#f3f3f3",
                color: m.who === "you" ? "#fff" : INK,
                padding: "11px 15px",
                borderRadius: m.who === "you" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {m.text || m.english || ""}
            </div>
          ))}

          {convo.readback && (
            <div style={{ alignSelf: "stretch", border: `2px solid ${YELLOW}`, background: "#FFFDF5", borderRadius: 18, padding: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 14 }}>{t("pleaseConfirm")}</div>
              <div lang={lang || "en"} style={{ fontWeight: 600, marginBottom: 14, fontSize: 14, lineHeight: 1.4 }}>{readbackText || convo.readback}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="tap btn-reset" onClick={onYes} style={{ flex: 1, background: YELLOW, borderRadius: 24, padding: 13, textAlign: "center", fontWeight: 800, cursor: "pointer" }}>{t("yes")}</button>
                <button type="button" className="tap btn-reset" onClick={onNo} style={{ flex: 1, background: "#eee", borderRadius: 24, padding: 13, textAlign: "center", fontWeight: 800, cursor: "pointer" }}>{t("no")}</button>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {!pickingLang && convo.log.length <= 1 && (
          <div className="hide-scrollbar" style={{ display: "flex", gap: 8, padding: "0 16px 10px", overflowX: "auto" }}>
            {SUGGESTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className="tap btn-reset"
                onClick={() => onSend(UI_EN[key])}
                style={{ border: "1px solid #e0e0e0", borderRadius: 18, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#555", whiteSpace: "nowrap", background: "#fafafa" }}
              >
                {t(key)}
              </button>
            ))}
          </div>
        )}

        {!pickingLang && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 16px", borderTop: "1px solid #f0f0f0", background: "#fff" }}>
          <button
            type="button"
            className="tap btn-reset"
            onClick={listening || speaking || voicePreparing ? undefined : onMic}
            disabled={listening || speaking || voicePreparing}
            aria-label={listening ? "Listening — tap to stop" : "Speak to Zigi"}
            aria-pressed={listening}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: listening ? "#ff3b30" : speaking ? "#34c759" : voicePreparing ? "#ff9500" : YELLOW,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: listening || speaking || voicePreparing ? "default" : "pointer",
              opacity: listening || speaking || voicePreparing ? 0.85 : 1,
              flexShrink: 0,
            }}
          >
            {Ico.mic(INK)}
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("inputPlaceholder")}
            aria-label={t("inputPlaceholder")}
            style={{ flex: 1, border: "1px solid #e0e0e0", borderRadius: 22, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fafafa" }}
          />
          <button type="button" className="tap btn-reset" onClick={submit} aria-label="Send message" style={{ width: 44, height: 44, borderRadius: 22, background: INK, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {Ico.send("#fff")}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}