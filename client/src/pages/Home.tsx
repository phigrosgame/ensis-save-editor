import { useMemo, useState } from "react";
import { Check, ChevronRight, CircleHelp, Download, FileUp, Fingerprint, LockKeyhole, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { decodeSave, editSave, formatCount, type EditOptions, type EditSummary } from "@/lib/saveEditor";

const initialOptions: EditOptions = {
  materialsMultiplier: 100,
  yesterday: true,
  allRelics: false,
  allMaps: false,
  exploreCount: 100,
  runes: "",
};

const materialLabels: Record<string, string> = { wood: "木材", stone: "石材", metal: "金属", crystal: "水晶" };

export default function Home() {
  const [fileName, setFileName] = useState("尚未选择存档");
  const [rawSave, setRawSave] = useState("");
  const [options, setOptions] = useState<EditOptions>(initialOptions);
  const [summary, setSummary] = useState<EditSummary | null>(null);
  const [encodedResult, setEncodedResult] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const canEdit = Boolean(rawSave);
  const optionCount = useMemo(() => [options.yesterday, options.allRelics, options.allMaps, Boolean(options.runes.trim())].filter(Boolean).length, [options]);

  async function readFile(file: File) {
    setIsBusy(true);
    setError("");
    setSummary(null);
    try {
      const text = await file.text();
      decodeSave(text);
      setRawSave(text);
      setFileName(file.name);
      toast.success("存档已读取", { description: "文件只在当前浏览器内处理，不会上传。" });
    } catch (err) {
      setRawSave("");
      setError(err instanceof Error ? err.message : "无法读取该存档");
      toast.error("读取失败");
    } finally {
      setIsBusy(false);
    }
  }

  function edit() {
    if (!rawSave) return;
    setIsBusy(true);
    setError("");
    try {
      const result = editSave(decodeSave(rawSave), options);
      setEncodedResult(result.encoded);
      setSummary(result.summary);
      toast.success("修改完成", { description: "已重新编码并通过本地回读校验。" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
      toast.error("修改失败");
    } finally {
      setIsBusy(false);
    }
  }

  function download() {
    if (!encodedResult) return;
    const blob = new Blob([encodedResult], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${fileName.replace(/\.txt$/i, "")}-edited.txt`;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(href);
    }, 1500);
    toast.success("已开始下载");
  }

  function setOption<K extends keyof EditOptions>(key: K, value: EditOptions[K]) {
    setOptions((current) => ({ ...current, [key]: value }));
    setSummary(null);
    setEncodedResult("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0c1017] text-[#edf3f5]">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(circle_at_15%_10%,rgba(72,221,188,.16),transparent_32%),radial-gradient(circle_at_84%_0%,rgba(251,180,92,.14),transparent_27%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <header className="relative z-10 border-b border-white/10 bg-[#0c1017]/70 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#d8f37b] text-[#10150d] shadow-[0_0_34px_rgba(216,243,123,.2)]"><WandSparkles size={20} /></div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">ENSIS / SAVE FORGE</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#9da9ad]">Local save utility</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[#9da9ad] sm:flex"><LockKeyhole size={14} className="text-[#d8f37b]" /> 只在浏览器本地运行</div>
        </div>
      </header>

      <section className="relative z-10 container grid gap-10 py-14 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:py-20">
        <div className="max-w-3xl">
          <Badge className="mb-6 border border-[#d8f37b]/20 bg-[#d8f37b]/10 px-3 py-1 text-[#d8f37b] hover:bg-[#d8f37b]/10"><Sparkles size={13} className="mr-1.5" /> v0.6.8f / browser edition</Badge>
          <h1 className="font-display text-5xl font-semibold leading-[.98] tracking-[-0.055em] text-balance sm:text-7xl">把存档交给<br /><span className="text-[#d8f37b]">Forge。</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#a8b3b5] sm:text-lg">一个不上传存档的 Ensis IDLE 编辑器。选择文件，勾选想要的改动，在本地重新编码并下载一份可以直接导入的副本。</p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs text-[#9da9ad]"><span className="rounded-full border border-white/10 px-3 py-1.5">Base64 JSON</span><span className="rounded-full border border-white/10 px-3 py-1.5">零服务器</span><span className="rounded-full border border-white/10 px-3 py-1.5">可回读验证</span></div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-[#78878b]">Current recipe</p><p className="mt-2 text-xl font-medium">快速配方</p></div><div className="rounded-full bg-[#d8f37b]/10 px-3 py-1 text-xs text-[#d8f37b]">{optionCount} 个附加项</div></div>
          <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-black/20 p-4"><p className="text-[#78878b]">材料倍率</p><p className="mt-2 font-mono text-2xl text-[#edf3f5]">×{options.materialsMultiplier}</p></div><div className="rounded-2xl bg-black/20 p-4"><p className="text-[#78878b]">地图次数</p><p className="mt-2 font-mono text-2xl text-[#edf3f5]">{options.allMaps ? options.exploreCount : "—"}</p></div></div>
          <p className="mt-5 text-xs leading-5 text-[#78878b]">默认材料按各自仓库容量的 100 倍写入。其余选项按需打开。</p>
        </div>
      </section>

      <section className="relative z-10 container pb-20">
        <div className="grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
          <Card className="border-white/10 bg-[#121923]/85 text-[#edf3f5] shadow-2xl shadow-black/20">
            <CardHeader><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-[#78878b]">01 / Input</p><CardTitle className="mt-2 font-display text-2xl">载入存档</CardTitle></div><Fingerprint className="text-[#d8f37b]" size={24} /></div></CardHeader>
            <CardContent>
              <label className="group relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#53636a] bg-black/15 px-5 text-center transition hover:border-[#d8f37b]/70 hover:bg-[#d8f37b]/[.035]">
                <input type="file" accept=".txt,text/plain" aria-label="选择存档文件" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-[0.01]" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} />
                <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#d8f37b]/10 text-[#d8f37b] transition group-hover:scale-105"><FileUp size={22} /></div>
                <p className="font-medium">点击选择 .txt 存档</p><p className="mt-2 max-w-xs text-xs leading-5 text-[#78878b]">严格解析 Base64 与 JSON。损坏或截断的内容会被拒绝。</p>
              </label>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm"><span className="truncate text-[#a8b3b5]">{fileName}</span>{rawSave && <Check size={16} className="shrink-0 text-[#d8f37b]" />}</div>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#78878b]"><LockKeyhole size={14} className="mt-0.5 shrink-0 text-[#d8f37b]" />文件不会离开当前浏览器标签页。网站没有上传接口，也不保存历史文件。</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#121923]/85 text-[#edf3f5] shadow-2xl shadow-black/20">
            <CardHeader><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-[#78878b]">02 / Recipe</p><CardTitle className="mt-2 font-display text-2xl">选择修改</CardTitle></div><CircleHelp className="text-[#78878b]" size={22} /></div></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4"><div className="flex items-center justify-between"><Label htmlFor="materials" className="text-sm">材料倍率</Label><span className="font-mono text-xs text-[#d8f37b]">×{options.materialsMultiplier}</span></div><Input id="materials" type="number" min="0" step="1" value={options.materialsMultiplier} onChange={(e) => setOption("materialsMultiplier", Math.max(0, Number(e.target.value) || 0))} className="mt-3 border-white/10 bg-white/[.04] font-mono" /><p className="mt-2 text-[11px] text-[#78878b]">按仓库容量计算，默认 100 倍</p></div>
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4"><div className="flex items-center justify-between"><Label htmlFor="runes" className="text-sm">符文目标</Label><span className="font-mono text-xs text-[#d8f37b]">可选</span></div><Input id="runes" inputMode="numeric" placeholder="例如 1000000" value={options.runes} onChange={(e) => setOption("runes", e.target.value.replace(/[^0-9]/g, ""))} className="mt-3 border-white/10 bg-white/[.04] font-mono" /><p className="mt-2 text-[11px] text-[#78878b]">留空则保留原值</p></div>
              </div>
              <Separator className="bg-white/10" />
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionRow label="时间戳改为昨天" hint="回退 24 小时" checked={options.yesterday} onCheckedChange={(value) => setOption("yesterday", value)} />
                <OptionRow label="补齐全部遗物" hint="28 种 × 100" checked={options.allRelics} onCheckedChange={(value) => setOption("allRelics", value)} />
                <OptionRow label="打开全部地图" hint="17 个区域" checked={options.allMaps} onCheckedChange={(value) => setOption("allMaps", value)} />
                <div className={`rounded-xl border p-3 transition ${options.allMaps ? "border-[#d8f37b]/30 bg-[#d8f37b]/[.05]" : "border-white/8 bg-black/10 opacity-55"}`}><div className="flex items-center justify-between"><Label htmlFor="explore" className="text-sm">探索次数</Label><span className="font-mono text-xs text-[#d8f37b]">{options.exploreCount}</span></div><Input id="explore" type="number" min="0" step="1" disabled={!options.allMaps} value={options.exploreCount} onChange={(e) => setOption("exploreCount", Math.max(0, Number(e.target.value) || 0))} className="mt-2 h-8 border-white/10 bg-white/[.04] font-mono" /></div>
              </div>
              <Button onClick={edit} disabled={!canEdit || isBusy} className="h-12 w-full bg-[#d8f37b] font-semibold text-[#10150d] hover:bg-[#e3ff93] active:scale-[.98]">{isBusy ? "处理中…" : "锻造存档"}<ChevronRight size={18} /></Button>
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            </CardContent>
          </Card>
        </div>

        {summary && <Card className="mt-5 border-[#d8f37b]/20 bg-[#d8f37b]/[.055] text-[#edf3f5] shadow-2xl shadow-[#d8f37b]/5"><CardContent className="p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-[#b1c76d]">03 / Forged result</p><h2 className="mt-2 font-display text-3xl font-semibold">成品已准备好</h2><p className="mt-2 text-sm text-[#a8b3b5]">本地重新编码完成，可以下载后导入游戏。</p></div><Button onClick={download} className="h-11 bg-[#edf3f5] text-[#0c1017] hover:bg-white"><Download size={17} />下载存档</Button></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(summary.materials).map(([key, value]) => <div key={key} className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-xs text-[#78878b]">{materialLabels[key]}</p><p className="mt-2 break-all font-mono text-sm text-[#d8f37b]">{formatCount(value)}</p></div>)}</div><div className="mt-4 grid gap-3 text-sm text-[#a8b3b5] sm:grid-cols-3"><div className="rounded-xl bg-black/15 px-4 py-3">遗物：<strong className="text-[#edf3f5]">{summary.relicCount} 种</strong></div><div className="rounded-xl bg-black/15 px-4 py-3">地图：<strong className="text-[#edf3f5]">{summary.mapCount} 个</strong>{summary.exploreCount !== null && ` / ${summary.exploreCount} 次`}</div><div className="rounded-xl bg-black/15 px-4 py-3">符文：<strong className="text-[#edf3f5]">{summary.runes ? formatCount(summary.runes) : "保留原值"}</strong></div></div>{summary.timestamp && <p className="mt-4 text-xs text-[#78878b]">导出时间字段：{summary.timestamp}</p>}</CardContent></Card>}
      </section>

      <footer className="relative z-10 border-t border-white/10"><div className="container flex flex-col gap-3 py-6 text-xs text-[#78878b] sm:flex-row sm:items-center sm:justify-between"><span>ENSIS / SAVE FORGE</span><span>本地优先 · 不上传存档 · 由开源流程驱动</span></div></footer>
    </main>
  );
}

function OptionRow({ label, hint, checked, onCheckedChange }: { label: string; hint: string; checked: boolean; onCheckedChange: (value: boolean) => void }) {
  return <div className={`flex items-center justify-between rounded-xl border p-3 transition ${checked ? "border-[#d8f37b]/30 bg-[#d8f37b]/[.05]" : "border-white/8 bg-black/10"}`}><div><p className="text-sm">{label}</p><p className="mt-1 text-[11px] text-[#78878b]">{hint}</p></div><Switch checked={checked} onCheckedChange={onCheckedChange} /></div>;
}
