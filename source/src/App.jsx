import React, { useState, useEffect, useMemo } from "react";
import {
  Plane, BedDouble, UtensilsCrossed, TrainFront, Wifi, FileCheck, Gift,
  Banknote, CreditCard, Users, Camera, Printer, Check, Delete, Plus, Minus,
  ChevronDown, Receipt, MapPin, X,
} from "lucide-react";

/* ── currency meta (accent = passport-stamp ink per country) ── */
const CUR = {
  EUR: { sym: "€",   code: "EUR", flag: "🇫🇷", place: "法國", color: "#34487E" },
  PLN: { sym: "zł",  code: "PLN", flag: "🇵🇱", place: "波蘭", color: "#B5322B" },
  TWD: { sym: "NT$", code: "TWD", flag: "🇹🇼", place: "台灣", color: "#1C1C1A" },
  USD: { sym: "$",   code: "USD", flag: "🇺🇸", place: "美國", color: "#2E7D5B" },
  GBP: { sym: "£",   code: "GBP", flag: "🇬🇧", place: "英國", color: "#6B2D5C" },
};

/* ── this trip (seeded from 2026_06 sheet) ── */
const TRIP = {
  name: "Paris & Poland",
  period: "2026 / 06",
  range: "6/15 – 6/25 · 11 天",
  base: "TWD",
};

/* locked rates → TWD (editable per trip later) */
const RATES = { EUR: 37.03, PLN: 8.7, TWD: 1, USD: 31.62, GBP: 39.6 };
/* currencies you can pick — pick anything, anywhere */
const PICK = ["EUR", "PLN", "TWD", "USD", "GBP"];

const CATS = [
  { k: "餐飲", icon: UtensilsCrossed },
  { k: "車資", icon: TrainFront },
  { k: "住宿", icon: BedDouble },
  { k: "機票", icon: Plane },
  { k: "電信網路", icon: Wifi },
  { k: "簽證費", icon: FileCheck },
  { k: "禮品費", icon: Gift },
];

const PAYS = [
  { k: "付現", icon: Banknote },
  { k: "刷卡", icon: CreditCard },
];

/* ── seed: the real entries from your spreadsheet ── */
const SEED = [
  { id: 1, cat: "機票", cur: "TWD", amt: 86837,   pay: "刷卡", people: 1, receipt: "有",  note: "長榮 TPE-CDG" },
  { id: 2, cat: "機票", cur: "TWD", amt: 12342,   pay: "刷卡", people: 1, receipt: "有",  note: "法航 CDG-WAW" },
  { id: 3, cat: "住宿", cur: "EUR", amt: 1708.56, pay: "刷卡", people: 1, receipt: "要印", note: "Paris 會場" },
  { id: 4, cat: "住宿", cur: "PLN", amt: 2753.72, pay: "刷卡", people: 1, receipt: "要印", note: "波蘭會場" },
  { id: 5, cat: "住宿", cur: "EUR", amt: 153.97,  pay: "刷卡", people: 1, receipt: "要印", note: "Paris 機場" },
];

const fmt = (n, d = 0) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const toTWD = (amt, cur) => Math.round(amt * (RATES[cur] ?? 1));

const STORE_KEY = "biz_bill_v1";

export default function App() {
  const [expenses, setExpenses] = useState(() => {
    try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : SEED; }
    catch { return SEED; }
  });
  const [editingId, setEditingId] = useState(null);
  const [amount, setAmount] = useState("0");
  const [cur, setCur] = useState("EUR");
  const [cat, setCat] = useState(null);
  const [pay, setPay] = useState("付現");
  const [people, setPeople] = useState(1);
  const [photo, setPhoto] = useState(null); // 收據照片(dataURL);有照片=有收據,沒拍=要印
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [flash, setFlash] = useState(false);

  /* persist every change so refresh / 重開 App 不會掉帳 */
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(expenses)); } catch {}
  }, [expenses]);

  const subtotals = useMemo(() => {
    const m = { TWD: 0 };
    expenses.forEach((e) => { m[e.cur] = (m[e.cur] || 0) + e.amt; });
    return m;
  }, [expenses]);

  const curKeys = useMemo(() => PICK.filter((c) => subtotals[c] !== undefined), [subtotals]);

  const grandTWD = useMemo(
    () => expenses.reduce((s, e) => s + toTWD(e.amt, e.cur), 0),
    [expenses]
  );

  const accent = CUR[cur].color;
  const amtNum = parseFloat(amount) || 0;
  const canSave = amtNum > 0 && cat;

  const press = (key) => {
    setAmount((a) => {
      if (key === "del") return a.length <= 1 ? "0" : a.slice(0, -1);
      if (key === ".") return a.includes(".") ? a : a + ".";
      const next = a === "0" && key !== "." ? key : a + key;
      const dec = next.split(".")[1];
      if (dec && dec.length > 2) return a;
      return next.length > 10 ? a : next;
    });
  };

  const resetForm = () => {
    setAmount("0"); setCat(null); setPeople(1); setPhoto(null); setNote(""); setShowNote(false);
  };

  const save = () => {
    if (!canSave) return;
    const receipt = photo ? "有" : "要印"; // 有拍=有收據,沒拍=要印(不用手選)
    if (editingId != null) {
      setExpenses((xs) =>
        xs.map((e) =>
          e.id === editingId
            ? { ...e, cat, cur, amt: amtNum, pay, people, receipt, photo, note: note.trim() }
            : e
        )
      );
      setEditingId(null);
    } else {
      setExpenses((xs) => [
        { id: Date.now(), cat, cur, amt: amtNum, pay, people, receipt, photo, note: note.trim() },
        ...xs,
      ]);
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
    resetForm();
  };

  /* 隨拍隨記:拍/選一張收據,壓縮後存成 dataURL */
  const attachPhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        const MAX = 900;
        if (w > h && w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        else if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; }
        const cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        setPhoto(cv.toDataURL("image/jpeg", 0.55));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  /* tap a logged row → load it into the form for editing */
  const startEdit = (e) => {
    setAmount(String(e.amt)); setCur(e.cur); setCat(e.cat); setPay(e.pay);
    setPeople(e.people); setPhoto(e.photo || null);
    setNote(e.note || ""); setShowNote(!!(e.note && e.note.length));
    setEditingId(e.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (id) => {
    setExpenses((xs) => xs.filter((e) => e.id !== id));
    if (editingId === id) { setEditingId(null); resetForm(); }
  };

  const pickCur = (c) => { setCur(c); setShowCur(false); };

  return (
    <div className="ff min-h-screen w-full flex justify-center" style={{ background: "#EDEBE4" }}>
      <div className="w-full max-w-md flex flex-col" style={{ background: "#F6F5F1" }}>

        {/* ── trip header / live 自動總結 ── */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
            <MapPin size={13} strokeWidth={2.4} />
            <span>{TRIP.period}</span><span>·</span><span>{TRIP.range}</span>
          </div>
          <h1 className="fd text-2xl font-bold text-stone-900 mt-0.5 tracking-tight">
            {TRIP.name} <span className="text-base">🇫🇷 🇵🇱</span>
          </h1>

          <div className="mt-3 flex items-end justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {curKeys.map((c) => (
                <div key={c} className="rounded-xl px-2.5 py-1.5 bg-white border border-stone-200">
                  <div className="text-[10px] font-semibold tnum" style={{ color: CUR[c].color }}>
                    {CUR[c].sym}{fmt(subtotals[c], c === "TWD" ? 0 : 2)}
                  </div>
                  <div className="text-[9px] text-stone-400 font-medium">{c}</div>
                </div>
              ))}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-stone-400 font-medium">這趟總計</div>
              <div className="fd text-xl font-bold text-stone-900 tnum leading-none">
                NT${fmt(grandTWD)}
              </div>
            </div>
          </div>
        </div>

        {/* ── amount hero + currency stamp ── */}
        <div className="px-5">
          <div className="bg-white rounded-3xl border border-stone-200 px-5 pt-5 pb-4 shadow-sm relative">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-stone-400 mt-1">記一筆</span>
              {/* currency stamp = the signature → tap to pick any currency */}
              <div className="relative">
                <button
                  onClick={() => setShowCur((v) => !v)}
                  className="flex items-center gap-1.5 rounded-2xl px-3 py-1.5 active:scale-95 transition"
                  style={{
                    border: `1.5px dashed ${accent}`, color: accent,
                    transform: "rotate(-4deg)", background: `${accent}0D`,
                  }}
                >
                  <span className="text-sm">{CUR[cur].flag}</span>
                  <span className="fd text-sm font-bold">{CUR[cur].code}</span>
                  <span className="text-[10px] font-medium tnum opacity-70">×{RATES[cur]}</span>
                  <ChevronDown size={13} strokeWidth={2.5} />
                </button>

                {showCur && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCur(false)} />
                    <div className="absolute right-0 mt-2 z-20 w-44 bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden pop">
                      <div className="px-3 py-2 text-[10px] font-semibold text-stone-400 border-b border-stone-100">
                        選幣別 · 自動帶匯率
                      </div>
                      {PICK.map((c) => {
                        const on = c === cur;
                        return (
                          <button key={c} onClick={() => pickCur(c)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 active:bg-stone-50 transition"
                            style={on ? { background: `${CUR[c].color}0D` } : {}}>
                            <span className="text-base">{CUR[c].flag}</span>
                            <span className="fd text-sm font-bold" style={{ color: CUR[c].color }}>{c}</span>
                            <span className="text-[11px] text-stone-400 ml-auto tnum">×{RATES[c]}</span>
                            {on && <Check size={14} strokeWidth={3} style={{ color: CUR[c].color }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="fd text-3xl font-semibold tnum" style={{ color: accent }}>{CUR[cur].sym}</span>
              <span className="fd text-6xl font-bold tnum leading-none break-all" style={{ color: accent }}>
                {amount === "0" ? "0" : amount}
              </span>
            </div>
            <div className="text-xs text-stone-400 font-medium mt-1.5 tnum">
              ≈ NT${fmt(toTWD(amtNum, cur))}
            </div>

            {flash && (
              <div className="absolute inset-0 flex items-center justify-center pop rounded-3xl overflow-hidden"
                   style={{ background: "rgba(255,255,255,.82)" }}>
                <div className="flex items-center gap-2 font-semibold" style={{ color: accent }}>
                  <Check size={22} strokeWidth={3} /> 已存
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── categories ── */}
        <div className="px-5 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATS.map(({ k, icon: Ic }) => {
              const on = cat === k;
              return (
                <button key={k} onClick={() => setCat(k)}
                  className="flex flex-col items-center gap-1 rounded-2xl px-3.5 py-2.5 shrink-0 transition active:scale-95 border"
                  style={on
                    ? { background: accent, borderColor: accent, color: "#fff" }
                    : { background: "#fff", borderColor: "#E7E5DF", color: "#57534E" }}>
                  <Ic size={18} strokeWidth={2} />
                  <span className="text-[11px] font-semibold whitespace-nowrap">{k}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── secondary row: pay · people · receipt · note ── */}
        <div className="px-5 pt-3 space-y-2">
          <div className="flex gap-2">
            {PAYS.map(({ k, icon: Ic }) => {
              const on = pay === k;
              return (
                <button key={k} onClick={() => setPay(k)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition active:scale-95 border"
                  style={on
                    ? { background: "#1C1C1A", borderColor: "#1C1C1A", color: "#fff" }
                    : { background: "#fff", borderColor: "#E7E5DF", color: "#57534E" }}>
                  <Ic size={14} strokeWidth={2.2} /> {k}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            {/* people = note for accounting, default 1 */}
            <div className="flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-2.5 py-1.5">
              <Users size={15} className="text-stone-400" strokeWidth={2.2} />
              <button onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center active:scale-90">
                <Minus size={13} strokeWidth={2.6} />
              </button>
              <span className="fd text-sm font-bold tnum w-9 text-center">{people} 人</span>
              <button onClick={() => setPeople((p) => Math.min(20, p + 1))}
                className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center active:scale-90">
                <Plus size={13} strokeWidth={2.6} />
              </button>
            </div>

            {/* 收據 = 隨拍隨記。拍了就是有收據,沒拍的存檔自動標「要印」 */}
            <button onClick={() => document.getElementById("bbphoto")?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition active:scale-95 border"
              style={photo
                ? { background: "#1C6B4733", borderColor: "#1C6B47", color: "#13653f" }
                : { background: "#fff", borderColor: "#E7E5DF", color: "#78716C" }}>
              {photo ? <Check size={14} strokeWidth={2.6} /> : <Camera size={14} strokeWidth={2.2} />}
              {photo ? "已拍收據" : "拍收據"}
            </button>
            {photo && (
              <div className="relative shrink-0">
                <img src={photo} alt="收據" className="w-9 h-9 rounded-lg object-cover border border-stone-200" />
                <button onClick={() => setPhoto(null)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-stone-800 text-white text-[9px] flex items-center justify-center">✕</button>
              </div>
            )}
            <input id="bbphoto" type="file" accept="image/*" capture="environment"
              style={{ display: "none" }}
              onChange={(e) => { attachPhoto(e.target.files && e.target.files[0]); e.target.value = ""; }} />
          </div>

          {showNote ? (
            <input autoFocus value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="備註(選填)— 例:跟 Alan、Vanessa 晚餐"
              className="w-full rounded-xl bg-white border border-stone-200 px-3 py-2 text-sm outline-none"
              style={{ caretColor: accent }} />
          ) : (
            <button onClick={() => setShowNote(true)}
              className="text-xs font-medium text-stone-400 flex items-center gap-1 active:text-stone-600">
              <Plus size={13} strokeWidth={2.4} /> 加備註
            </button>
          )}
        </div>

        {/* ── keypad ── */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9",".","0","del"].map((k) => (
              <button key={k} onClick={() => press(k)}
                className="bg-white rounded-2xl py-3.5 flex items-center justify-center active:scale-95 transition border border-stone-200 shadow-sm">
                {k === "del"
                  ? <Delete size={20} className="text-stone-500" strokeWidth={2} />
                  : <span className="fd text-2xl font-semibold text-stone-800 tnum">{k}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── save ── */}
        <div className="px-5 pt-3 pb-4">
          <button onClick={save} disabled={!canSave}
            className="w-full rounded-2xl py-4 fd text-lg font-bold text-white flex items-center justify-center gap-2 transition active:scale-[.98]"
            style={{ background: canSave ? accent : "#D6D3CD",
                     boxShadow: canSave ? `0 8px 20px -8px ${accent}` : "none" }}>
            <Receipt size={20} strokeWidth={2.2} />
            {canSave
              ? `${editingId != null ? "更新這筆" : "存下這筆"} · ${CUR[cur].sym}${amount}`
              : "先輸入金額、選類別"}
          </button>
        </div>

        {/* ── logged list ── */}
        <div className="px-5 pb-8">
          <div className="text-xs font-semibold text-stone-400 mb-2 px-1">
            這趟記了 {expenses.length} 筆
          </div>
          <div className="space-y-1.5">
            {expenses.map((e) => {
              const c = CUR[e.cur];
              const Ic = CATS.find((x) => x.k === e.cat)?.icon || Receipt;
              return (
                <div key={e.id} onClick={() => startEdit(e)}
                     className="bg-white rounded-2xl border border-stone-200 px-3.5 py-2.5 flex items-center gap-3 cursor-pointer active:scale-[.98] transition">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: `${c.color}14` }}>
                    <Ic size={16} strokeWidth={2} color={c.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-stone-800">{e.cat}</span>
                      {e.people > 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tnum"
                              style={{ background: "#1C1C1A", color: "#fff" }}>{e.people}人</span>
                      )}
                      {e.receipt === "要印" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{ background: "#C2410C22", color: "#9a3412" }}>要印</span>
                      )}
                      {e.photo && <span className="text-[11px] leading-none">📷</span>}
                    </div>
                    <div className="text-[11px] text-stone-400 truncate">
                      {e.pay}{e.note ? ` · ${e.note}` : ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="fd text-sm font-bold tnum" style={{ color: c.color }}>
                      {c.sym}{fmt(e.amt, e.cur === "TWD" ? 0 : 2)}
                    </div>
                    {e.cur !== "TWD" && (
                      <div className="text-[10px] text-stone-400 tnum">NT${fmt(toTWD(e.amt, e.cur))}</div>
                    )}
                  </div>
                  <button onClick={(ev) => { ev.stopPropagation(); remove(e.id); }}
                    aria-label="刪除"
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 active:text-red-600 active:bg-red-50 transition">
                    <X size={16} strokeWidth={2.4} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
