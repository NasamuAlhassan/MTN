import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { AssistantSheet } from "./components/AssistantSheet.jsx";
import { ConceptBanner, PhoneFrame, StatusBar } from "./components/PhoneFrame.jsx";
import { PinGate } from "./components/PinGate.jsx";
import { TabBar } from "./components/TabBar.jsx";
import { ZigiButton } from "./components/ZigiButton.jsx";

import { NARRATION_EN } from "./content/narration.en.js";
import { SCREENS } from "./navigation/screens.js";
import { createConvo, confirmNo, confirmYes, safeProcessUtterance } from "./voice/dialogue.js";
import { understandUtterance } from "./voice/understand.js";
import { unlockAudio } from "./khaya/audioPlayer.js";
import { createASR, micHelpMessage } from "./voice/asr.js";

import { UI_EN } from "./content/ui.en.js";
import { buildPinHandoffText } from "./voice/pinSummary.js";
import { retranslateLog } from "./voice/retranslateLog.js";
import { resolveSpokenLine } from "./voice/speakLine.js";
import { clearUiCache } from "./voice/uiLocalize.js";
import { createTTS } from "./voice/tts.js";

// Eager — the four tab roots are needed for first paint.
import { Home } from "./screens/Home.jsx";
import { Buy } from "./screens/Buy.jsx";
import { Momo } from "./screens/Momo.jsx";
import { More } from "./screens/More.jsx";
import { USER } from "./data/user.js";

// Lazy — deep sub-screens are only reached after navigation, so they load on
// demand as separate chunks (smaller initial bundle).
const named = (loader, key) => lazy(() => loader().then((m) => ({ default: m[key] })));
const DataBundles = named(() => import("./screens/DataBundles.jsx"), "DataBundles");
const DataCategories = named(() => import("./screens/DataCategories.jsx"), "DataCategories");
const BuyAirtime = named(() => import("./screens/BuyAirtime.jsx"), "BuyAirtime");
const Mashup = named(() => import("./screens/Mashup.jsx"), "Mashup");
const SendMomo = named(() => import("./screens/SendMomo.jsx"), "SendMomo");
const Just4U = named(() => import("./screens/Just4U.jsx"), "Just4U");
const SocialBundles = named(() => import("./screens/SocialBundles.jsx"), "SocialBundles");
const MidnightBundle = named(() => import("./screens/MidnightBundle.jsx"), "MidnightBundle");
const InfoStub = named(() => import("./screens/MenuScreen.jsx"), "InfoStub");
const NetworkPicker = named(() => import("./screens/NetworkPicker.jsx"), "NetworkPicker");
const ContactsPicker = named(() => import("./screens/NetworkPicker.jsx"), "ContactsPicker");
const BalanceDetails = named(() => import("./screens/BalanceDetails.jsx"), "BalanceDetails");
const Promo = named(() => import("./screens/Promo.jsx"), "Promo");

const STUBS = {
  [SCREENS.INTERNATIONAL]: { title: "International Bundles", body: "Roaming and international calling bundles for travel and diaspora connections." },
  [SCREENS.BUSINESS]: { title: "Business Bundles", body: "Data and voice packages tailored for business and SME customers." },
  [SCREENS.FIBRE]: { title: "Fibre & Turbonet", body: "Home and office broadband — fibre and Turbonet packages." },
  [SCREENS.KOKROKOO]: { title: "Kokrokoo", body: "Morning bundles combining voice minutes and data." },
  [SCREENS.VIDEO]: { title: "Video Bundles", body: "Streaming-friendly data for YouTube, Netflix and more." },
  [SCREENS.APPROVALS]: { title: "Approvals", body: "Review and approve pending MoMo payment requests." },
  [SCREENS.CASHOUT]: { title: "Cashout", body: "Withdraw MoMo to cash at an agent or ATM." },
  [SCREENS.BANK]: { title: "Bank Services", body: "Link your bank, transfer between MoMo and bank accounts." },
  [SCREENS.MOMO_PAY]: { title: "Momo Pay", body: "Scan a merchant QR code to pay with MoMo." },
  [SCREENS.STATEMENTS]: { title: "Statements", body: "View and download your MoMo transaction history." },
  [SCREENS.FRAUD]: { title: "Report Fraud", body: "Report suspicious MoMo activity to MTN fraud team." },
  [SCREENS.LOYALTY]: { title: "Loyalty Points", body: `You have ${USER.loyalty} loyalty points. Redeem for airtime, data and prizes.` },
  [SCREENS.NOTIFICATIONS]: { title: "Notifications", body: "Promos, transaction alerts, and account updates." },
  [SCREENS.PROFILE]: { title: "My Profile", body: `${USER.fullName} · ${USER.number}\nManage your account details and preferences.` },
  [SCREENS.DIGITAL]: { title: "Digital Services", body: "Caller tunes, insurance, content subscriptions and more." },
  [SCREENS.MY_ACCOUNT]: { title: "My Account", body: "View your history and manage subscriptions anytime." },
  [SCREENS.MORE_MTN]: { title: "More From MTN", body: "Discover MTN services, offers, and exclusive partner deals." },
  [SCREENS.SELF_SERVICE]: { title: "Self Service", body: "Quickly perform SIM, data, and airtime actions yourself." },
  [SCREENS.HELP]: { title: "Help and Support", body: "Browse FAQs, chat with support, or call 100 for customer care." },
  [SCREENS.BROADBAND]: { title: "Broadband Bundles", body: "Fibre and Turbonet packages for home and office." },
};

export default function App() {
  const [lang, setLang] = useState(null);
  const [stack, setStack] = useState([{ tab: "home", sub: null }]);
  const [prefill, setPrefill] = useState({});
  const [highlight, setHighlight] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voicePreparing, setVoicePreparing] = useState(false);
  const [convo, setConvo] = useState(createConvo);
  const greeted = useRef(false);
  const convoRef = useRef(convo);
  convoRef.current = convo;

  const screen = stack[stack.length - 1];
  const tts = useMemo(() => createTTS(lang || "en"), [lang]);
  const asr = useMemo(() => createASR(lang || "en"), [lang]);

  const navigate = useCallback((patch) => {
    setStack((s) => {
      const cur = s[s.length - 1];
      if (patch.tab && patch.tab !== cur.tab) {
        return [{ tab: patch.tab, sub: patch.sub ?? null, meta: patch.meta }];
      }
      if ("sub" in patch) {
        if (patch.sub === null) return [{ tab: cur.tab, sub: null }];
        if (patch.sub === cur.sub && !patch.meta) return s;
        return [...s, { tab: cur.tab, sub: patch.sub, meta: patch.meta }];
      }
      return s;
    });
  }, []);

  const pushSub = useCallback((sub) => navigate({ sub }), [navigate]);

  const goToTab = useCallback((tab) => {
    setStack([{ tab, sub: null }]);
    setPrefill({});
    setHighlight(null);
  }, []);

  const goBack = useCallback(() => {
    setStack((s) => {
      if (s.length > 1) return s.slice(0, -1);
      if (s[0].sub) return [{ tab: s[0].tab, sub: null }];
      return s;
    });
  }, []);

  const applyDispatch = useCallback((dispatch) => {
    if (!dispatch) return;
    setStack([
      { tab: "home", sub: null },
      { tab: dispatch.tab, sub: dispatch.sub },
    ]);
    setPrefill(dispatch.prefill || {});
    setHighlight(dispatch.highlight ?? null);
  }, []);

  const applyNavigate = useCallback(
    (nav) => {
      if (!nav) return;
      applyDispatch(nav);
      setAssistantOpen(false);
    },
    [applyDispatch]
  );

  const deliverReply = useCallback(
    async (r, langCode) => {
      const code = langCode || lang || "en";
      setVoicePreparing(true);
      try {
        const { english, display, spoken } = await resolveSpokenLine(r.text, r.lineId, code);
        if (!r.readback) {
          const shown = display || english;
          setConvo((c) => {
            const last = c.log[c.log.length - 1];
            if (last?.who === "z" && last?.text === shown) return c;
            return { ...c, log: [...c.log, { who: "z", text: shown, english }] };
          });
        }
        setVoicePreparing(false);
        setSpeaking(true);
        await tts.speak(r.lineId, r.text, code, { spokenText: spoken });
      } catch (err) {
        console.error("[Zigi voice]", err);
        if (code === "tw" || code === "kus") {
          const failMsg = UI_EN.voiceFailed;
          setConvo((c) => ({
            ...c,
            log: [...c.log, { who: "z", text: failMsg, english: failMsg }],
          }));
        }
      } finally {
        setVoicePreparing(false);
        setSpeaking(false);
      }
    },
    [tts, lang]
  );

  const say = useCallback(
    async (text, lineId, langCode) => {
      const code = langCode || lang || "en";
      setVoicePreparing(true);
      try {
        const { english, display, spoken } = await resolveSpokenLine(text, lineId, code);
        const shown = display || english;
        setConvo((c) => ({ ...c, log: [...c.log, { who: "z", text: shown, english }] }));
        setVoicePreparing(false);
        setSpeaking(true);
        await tts.speak(lineId, text, code, { spokenText: spoken });
      } catch (err) {
        console.error("[Zigi voice]", err);
        if (code === "tw" || code === "kus") {
          const failMsg = UI_EN.voiceFailed;
          setConvo((c) => ({
            ...c,
            log: [...c.log, { who: "z", text: failMsg, english: failMsg }],
          }));
        }
      } finally {
        setVoicePreparing(false);
        setSpeaking(false);
      }
    },
    [tts, lang]
  );

  // Speak a line without adding it to the visible transcript (used for the
  // first-run audio cue, which must not linger in the chat log afterwards).
  const speakNoLog = useCallback(
    async (text, lineId, code) => {
      setVoicePreparing(true);
      try {
        const { spoken } = await resolveSpokenLine(text, lineId, code);
        setVoicePreparing(false);
        setSpeaking(true);
        await tts.speak(lineId, text, code, { spokenText: spoken });
      } catch (err) {
        console.error("[Zigi voice]", err);
      } finally {
        setVoicePreparing(false);
        setSpeaking(false);
      }
    },
    [tts]
  );

  const applyReplies = useCallback(
    async (replies, langCode) => {
      for (const r of replies) {
        await deliverReply(r, langCode);
      }
    },
    [deliverReply]
  );

  const openPin = useCallback(async ({ skipSpeak = false } = {}) => {
    setAssistantOpen(false);
    const code = lang || "en";
    const handoff = buildPinHandoffText({
      sub: screen.sub,
      prefill,
      highlight,
    });

    if (!skipSpeak && (code === "tw" || code === "kus") && handoff) {
      await say(handoff, "enter_pin", code);
    }

    setPinOpen(true);
  }, [lang, screen.sub, prefill, highlight, say]);

  const handleUtterance = useCallback(
    async (raw) => {
      const code = lang || "en";
      const understood = await understandUtterance(raw, code, convoRef.current);
      const result = safeProcessUtterance(convoRef.current, raw, code, understood);
      setConvo(result.convo);

      if (result.dispatch) applyDispatch(result.dispatch);
      else if (result.navigate) applyNavigate(result.navigate);

      await applyReplies(result.replies, code);

      if (result.needsPin) await openPin({ skipSpeak: true });
    },
    [lang, applyReplies, applyNavigate, applyDispatch, openPin]
  );

  const openAssistant = async () => {
    await unlockAudio();
    setAssistantOpen(true);
    if (!lang) {
      // First run: the user may not be able to read the picker, so speak an
      // invitation naming the options. (Pre-recorded native clips are the full
      // solution — see docs/ARCHITECTURE.md.)
      speakNoLog("Choose your language. Twi, Kusaal, or English.", "pick_language", "en");
      return;
    }
    if (!greeted.current) {
      greeted.current = true;
      await say(null, "greeting", lang);
    }
  };

  // Compute from the ref, then apply effects once. Keeping side effects OUT of
  // the setState updater avoids double-dispatch under React StrictMode (which
  // intentionally double-invokes updaters to surface impurity).
  const onYes = async () => {
    const result = confirmYes(convoRef.current);
    setConvo(result.convo);
    if (result.dispatch) applyDispatch(result.dispatch);
    else if (result.navigate) applyNavigate(result.navigate);
    await applyReplies(result.replies, lang);
    if (result.needsPin) await openPin({ skipSpeak: true });
  };

  const onNo = async () => {
    const result = confirmNo(convoRef.current);
    setConvo(result.convo);
    await applyReplies(result.replies, lang);
    applyNavigate(result.navigate);
  };

  const onMic = () => {
    if (listening) return;
    unlockAudio();
    setListening(true);

    const onResult = (transcript) => {
      setListening(false);
      if (transcript?.trim()) handleUtterance(transcript.trim());
    };

    const onError = (err) => {
      setListening(false);
      const msg = err?.message || micHelpMessage(lang || "en");
      say(msg);
    };

    asr.listen(onResult, onError, () => setListening(false));
  };

  const finishPin = async () => {
    setPinOpen(false);
    const msg = NARRATION_EN.complete;
    const code = lang || "en";
    const { english, display, spoken } = await resolveSpokenLine(msg, "complete", code);
    setConvo((c) => ({
      ...createConvo(),
      log: [...c.log, { who: "z", text: display, english }],
    }));
    setTimeout(async () => {
      setAssistantOpen(true);
      unlockAudio();
      setVoicePreparing(true);
      try {
        setVoicePreparing(false);
        setSpeaking(true);
        await tts.speak("complete", msg, code, { spokenText: spoken });
      } catch (err) {
        console.error("[Zigi voice]", err);
      } finally {
        setVoicePreparing(false);
        setSpeaking(false);
      }
    }, 300);
  };

  const selectLang = async (code) => {
    await unlockAudio();
    const changed = lang !== code;
    const prevLog = convoRef.current.log;

    setLang(code);
    if (changed && lang) clearUiCache(code);

    if (changed) {
      greeted.current = false;
      if (prevLog.length > 0) {
        const log = await retranslateLog(prevLog, code);
        setConvo({ ...createConvo(), log });
      } else {
        setConvo(createConvo());
      }
    }

    if (code === "tw" || code === "kus") {
      const entries = [
        "greeting",
        "not_understood",
        "cancelled",
        "complete",
        "enter_pin",
      ].map((lineId) => ({ lineId, text: NARRATION_EN[lineId] }));
      import("./khaya/client.js").then(({ warmVoiceCache }) => warmVoiceCache(entries, code));
    }

    if (assistantOpen && !greeted.current) {
      greeted.current = true;
      await say(null, "greeting", code);
    }
  };

  const selectBundle = (id) => setHighlight(id);

  const renderSubScreen = () => {
    const sub = screen.sub;
    if (!sub) return null;

    const back = goBack;
    if (sub === SCREENS.PROMO) return <Promo onBack={back} />;
    if (sub === SCREENS.BALANCE_DETAIL) return (
      <BalanceDetails
        type={screen.meta?.balanceType || "airtime"}
        onBack={back}
        onTopUp={() => pushSub(screen.meta?.balanceType === "data" ? SCREENS.DATA_CATEGORIES : SCREENS.AIRTIME)}
      />
    );
    if (sub === SCREENS.DATA_CATEGORIES) return <DataCategories onNavigate={pushSub} onBack={back} />;
    if (sub === SCREENS.DATA) return <DataBundles highlight={highlight} onSelect={selectBundle} onContinue={openPin} onBack={back} />;
    if (sub === SCREENS.JUST4U) return <Just4U highlight={highlight} onSelect={selectBundle} onContinue={openPin} onBack={back} />;
    if (sub === SCREENS.SOCIAL) return <SocialBundles highlight={highlight} onSelect={selectBundle} onContinue={openPin} onBack={back} />;
    if (sub === SCREENS.MIDNIGHT) return <MidnightBundle highlight={highlight} onSelect={selectBundle} onContinue={openPin} onBack={back} />;
    if (sub === SCREENS.AIRTIME) return <BuyAirtime prefill={prefill} onUpdatePrefill={setPrefill} onContinue={openPin} onBack={back} />;
    if (sub === SCREENS.MASHUP) return <Mashup highlight={highlight} onSelect={selectBundle} onContinue={openPin} onBack={back} />;
    if (sub === SCREENS.SEND) return <SendMomo prefill={prefill} onUpdatePrefill={setPrefill} onNavigate={pushSub} onContinue={openPin} onBack={back} />;
    if (sub === SCREENS.NETWORK_PICKER) return <NetworkPicker onSelect={() => goBack()} onBack={back} />;
    if (sub === SCREENS.CONTACTS) return (
      <ContactsPicker
        onBack={back}
        onSelect={(c) => {
          setPrefill((p) => ({ ...p, number: c.number, name: c.name }));
          goBack();
        }}
      />
    );

    const stub = STUBS[sub];
    if (stub) return <InfoStub title={stub.title} body={stub.body} onBack={back} />;

    return <InfoStub title="Coming soon" body="This section is part of the MyMTN shell prototype." onBack={back} />;
  };

  return (
    <PhoneFrame>
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", background: "#fff", minHeight: 0 }}>
        <StatusBar />
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {screen.sub ? (
            <Suspense fallback={<div aria-busy="true" style={{ padding: 24, color: "#767676", fontWeight: 600 }}>Loading…</div>}>
              {renderSubScreen()}
            </Suspense>
          ) : (
            <>
              {screen.tab === "home" && <Home onNavigate={navigate} />}
              {screen.tab === "buy" && <Buy onNavigate={pushSub} />}
              {screen.tab === "momo" && <Momo onNavigate={pushSub} />}
              {screen.tab === "more" && <More onNavigate={pushSub} />}
            </>
          )}
        </div>

        {!assistantOpen && <ZigiButton onClick={openAssistant} />}

        <TabBar active={screen.tab} onChange={goToTab} />
        <ConceptBanner />

        {assistantOpen && (
          <AssistantSheet
            lang={lang}
            convo={convo}
            onSend={handleUtterance}
            onYes={onYes}
            onNo={onNo}
            onClose={() => setAssistantOpen(false)}
            onSelectLang={selectLang}
            listening={listening}
            speaking={speaking}
            voicePreparing={voicePreparing}
            onMic={onMic}
          />
        )}
        {pinOpen && (
          <PinGate
            lang={lang}
            onDone={finishPin}
            onCancel={() => {
              setPinOpen(false);
              say("Cancelled. Anything else?", null, lang);
              setAssistantOpen(true);
            }}
          />
        )}
      </div>
    </PhoneFrame>
  );
}