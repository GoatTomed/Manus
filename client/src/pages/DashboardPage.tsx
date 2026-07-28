import { useState } from 'react';
import { DashboardShell, TabButton, PageTitle, Card, SkeletonRow } from '@/components/DashboardShell';
import { Search, ChevronDown, Plus, Link2, MoreVertical, FileCode2, Eye, Sparkles, Bot, CreditCard, SlidersHorizontal, Settings as SettingsIcon, Upload as UploadIcon, ShieldCheck } from 'lucide-react';

export function DashboardPage() {
  const [tab, setTab] = useState('obfuscate');
  return (
    <DashboardShell breadcrumb={breadcrumbFor(tab)} activeTab={tab} onTabChange={setTab}>
      {tab === 'obfuscate' && <ObfuscateView />}
      {tab === 'upload' && <UploadView />}
      {tab === 'billing' && <BillingView />}
      {tab === 'utilities' && <UtilitiesView />}
      {tab === 'oracle' && <OracleView />}
      {tab === 'genesis' && <GenesisView />}
      {tab === 'discord-bot' && <DiscordBotView />}
      {tab === 'settings' && <SettingsView />}
    </DashboardShell>
  );
}

function breadcrumbFor(tab: string): string {
  const map: Record<string, string> = {
    obfuscate: 'Obfuscate',
    upload: 'Upload',
    billing: 'Billing',
    utilities: 'Utilities',
    oracle: 'Oracle',
    genesis: 'Genesis',
    'discord-bot': 'Discord Bot',
    settings: 'Settings',
  };
  return map[tab] ?? 'Dashboard';
}

function ObfuscateView() {
  const [sub, setSub] = useState('files');
  return (
    <div className="space-y-5 mb-2">
      <div>
        <PageTitle>Obfuscate</PageTitle>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <TabButton label="Files" active={sub === 'files'} onClick={() => setSub('files')} />
          <TabButton label="Analytics" active={sub === 'analytics'} onClick={() => setSub('analytics')} />
        </div>
      </div>
      {sub === 'files' ? <ObfuscateFiles /> : <ObfuscateAnalytics />}
    </div>
  );
}

function ObfuscateFiles() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            className="w-full h-9 rounded-md border border-white/10 bg-white/[0.02] pl-8 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
            placeholder="Search files..."
          />
        </div>
        <button className="h-9 px-4 rounded-md border border-white/10 bg-white/[0.02] text-sm text-white/60 flex items-center justify-between gap-2">
          <span>All</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
        <button className="h-9 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>
      <Card>
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Your files</h2>
          <span className="text-sm text-white/40">0 files</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.015] text-white/40">
                <th className="text-left font-medium px-4 sm:px-6 py-2.5">Name</th>
                <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">Size</th>
                <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">Obfuscated</th>
                <th className="text-left font-medium px-3 py-2.5 hidden sm:table-cell">Updated</th>
                <th className="text-right font-medium px-4 sm:px-6 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ObfuscateAnalytics() {
  const stats = [
    { label: 'Total obfuscations', value: '0' },
    { label: 'This month', value: '0' },
    { label: 'Total executions', value: '0' },
    { label: 'Active scripts', value: '0' },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{s.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <p className="text-sm font-medium text-white">Execution activity</p>
        <div className="mt-6 flex items-end gap-2 h-40">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-white/[0.06]"
              style={{ height: `${20 + Math.sin(i * 0.5) * 30 + 20}%` }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function UploadView() {
  return (
    <div className="space-y-5 mb-2">
      <PageTitle>Upload</PageTitle>
      <Card className="p-8">
        <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-white/20 transition-colors cursor-pointer">
          <UploadIcon className="mx-auto h-10 w-10 text-white/30" />
          <p className="mt-4 text-sm text-white/60">Drop your Luau script here, or click to browse</p>
          <p className="mt-1 text-xs text-white/30">.lua, .luau, .txt up to 5.1 MB</p>
        </div>
      </Card>
    </div>
  );
}

function BillingView() {
  return (
    <div className="space-y-5 mb-2">
      <PageTitle>Billing</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Current plan', value: 'Free', sub: 'No active membership' },
          { label: 'Tokens remaining', value: '0', sub: 'No tokens purchased' },
          { label: 'This month', value: '$0.00', sub: '0 obfuscations' },
        ].map((s) => (
          <Card key={s.label} className="px-6 py-5">
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-white/30">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Payment history</h2>
        </div>
        <div className="p-6 text-center text-sm text-white/40">No payments yet</div>
      </Card>
    </div>
  );
}

function UtilitiesView() {
  const utils = [
    { name: 'String Encryptor', desc: 'Encrypt string literals for manual use', icon: FileCode2 },
    { name: 'Key Generator', desc: 'Generate random keys for Oracle', icon: ShieldCheck },
    { name: 'HWID Checker', desc: 'Look up hardware IDs for keys', icon: Eye },
    { name: 'Script Formatter', desc: 'Format and beautify Luau code', icon: FileCode2 },
  ];
  return (
    <div className="space-y-5 mb-2">
      <PageTitle>Utilities</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {utils.map((u) => (
          <Card key={u.name} className="p-5 flex items-center gap-4 hover:border-white/15 transition-colors cursor-pointer">
            <div className="h-11 w-11 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
              <u.icon className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{u.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{u.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OracleView() {
  const [sub, setSub] = useState('services');
  const subs = ['Services', 'Scripts', 'Keys', 'Monetization', 'Guide'];
  return (
    <div className="space-y-5 mb-2">
      <div>
        <PageTitle>Oracle</PageTitle>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {subs.map((s) => (
            <TabButton
              key={s}
              label={s}
              active={sub === s.toLowerCase()}
              onClick={() => setSub(s.toLowerCase())}
            />
          ))}
        </div>
      </div>
      {sub === 'services' && <OracleServices />}
      {sub === 'scripts' && <OracleScripts />}
      {sub === 'keys' && <OracleKeys />}
      {sub === 'monetization' && <OracleMonetization />}
      {sub === 'guide' && <OracleGuide />}
    </div>
  );
}

function OracleServices() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total services', value: '0', sub: 'Active integrations' },
          { label: 'Total keys', value: '0', sub: 'Across all services' },
          { label: 'Executions today', value: '0', sub: 'Last 24 hours' },
        ].map((s) => (
          <Card key={s.label} className="px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/[0.06] shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-white/[0.06]" />
              <div className="h-5 w-16 rounded bg-white/[0.06]" />
              <div className="h-3 w-28 rounded bg-white/[0.06]" />
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="px-6 py-4 border-b border-white/[0.07] flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div>
            <h2 className="font-medium text-white">Your Services</h2>
            <p className="text-white/40 text-sm">0 services</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                className="h-9 rounded-md border border-white/10 bg-white/[0.05] pl-9 pr-3 w-52 text-sm text-white placeholder:text-white/30 outline-none"
                placeholder="Search services..."
              />
            </div>
            <button className="h-9 px-3 rounded-md border border-white/10 bg-white/[0.05] text-sm text-white/60 flex items-center justify-between gap-2 w-36">
              <span>All</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/[0.07]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 animate-pulse">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="size-12 rounded-lg bg-white/[0.06]" />
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded bg-white/[0.06]" />
                  <div className="h-3 w-56 rounded bg-white/[0.06]" />
                  <div className="hidden md:block h-3 w-64 rounded bg-white/[0.06]" />
                </div>
              </div>
              <div className="hidden md:flex gap-2">
                <div className="h-8 w-16 rounded bg-white/[0.06]" />
                <div className="h-8 w-8 rounded bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function OracleScripts() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.015] text-white/40">
              <th className="text-left font-medium px-4 sm:px-6 py-2.5">Name</th>
              <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">Service</th>
              <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">Executions</th>
              <th className="text-left font-medium px-3 py-2.5 hidden sm:table-cell">Updated</th>
              <th className="text-right font-medium px-4 sm:px-6 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function OracleKeys() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 w-fit">
        <TabButton label="Keys" active={true} onClick={() => {}} />
        <TabButton label="Analytics" active={false} onClick={() => {}} />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-3.5 w-3.5" />
          <input
            className="w-full h-9 rounded-md border border-white/10 bg-white/[0.02] pl-8 text-sm text-white placeholder:text-white/30 outline-none"
            placeholder="Search by name or key…"
          />
        </div>
        {['Service', 'Status', 'Plan'].map((label) => (
          <button key={label} className="h-9 px-3 rounded-md border border-white/10 bg-white/[0.02] text-sm text-white/60 flex items-center justify-between gap-2 w-full sm:w-36">
            <span>{label}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        ))}
      </div>
      <Card>
        <div className="divide-y divide-white/[0.05]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-4 sm:px-6 py-4 animate-pulse space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded bg-white/[0.06] shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded bg-white/[0.06]" />
                    <div className="h-3 w-20 rounded bg-white/[0.06]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-12 rounded bg-white/[0.06]" />
                  <div className="h-7 w-16 rounded bg-white/[0.06]" />
                </div>
              </div>
              <div className="h-9 rounded-lg bg-white/[0.03]" />
              <div className="h-3 w-64 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OracleMonetization() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 w-fit">
        <TabButton label="Integrations" active={true} onClick={() => {}} />
        <TabButton label="Analytics" active={false} onClick={() => {}} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Linkvertise', status: 'Supported' },
          { name: 'Work.ink', status: 'Supported' },
          { name: 'LootLabs', status: 'Supported' },
        ].map((p) => (
          <Card key={p.name} className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] shrink-0 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-white/50" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{p.name}</p>
              <p className="text-xs text-white/40">{p.status}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Your integrations</h2>
          <span className="text-sm text-white/40">0 integrations</span>
        </div>
        <div className="p-6 flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white/[0.02] animate-pulse flex items-center justify-between p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-white/[0.06]" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 rounded bg-white/[0.06]" />
                  <div className="h-3 w-20 rounded bg-white/[0.06]" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-14 rounded-full bg-white/[0.06]" />
                <div className="h-8 w-16 rounded-full bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OracleGuide() {
  const steps = [
    { n: 1, title: 'Create a service', desc: 'Set up an Oracle service to group your scripts and keys together.' },
    { n: 2, title: 'Add scripts', desc: 'Upload or link the Luau scripts you want to protect under your service.' },
    { n: 3, title: 'Generate keys', desc: 'Create keys manually, in bulk, or through a gateway with HWID locking.' },
    { n: 4, title: 'Distribute', desc: 'Share your gate link or keys with users. Monitor executions in real time.' },
  ];
  return (
    <div className="space-y-4">
      {steps.map((s) => (
        <Card key={s.n} className="p-5 flex items-start gap-4">
          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white shrink-0">
            {s.n}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{s.title}</p>
            <p className="text-sm text-white/40 mt-1">{s.desc}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function GenesisView() {
  return (
    <div className="space-y-5 mb-2">
      <PageTitle>Genesis</PageTitle>
      <Card className="p-8">
        <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-white/20 transition-colors cursor-pointer">
          <Sparkles className="mx-auto h-10 w-10 text-white/30" />
          <p className="mt-4 text-sm text-white/60">Drop Luau bytecode here to decompile</p>
          <p className="mt-1 text-xs text-white/30">Output readable source code with clean variable names</p>
        </div>
      </Card>
    </div>
  );
}

function DiscordBotView() {
  return (
    <div className="space-y-5 mb-2">
      <PageTitle>Discord Bot</PageTitle>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-white/[0.05] flex items-center justify-center">
            <Bot className="h-6 w-6 text-white/50" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Connect your Discord server</p>
            <p className="text-xs text-white/40 mt-1">Manage keys, monitor services, and get alerts from Discord.</p>
          </div>
          <button className="h-9 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
            Connect
          </button>
        </div>
      </Card>
      <Card>
        <div className="px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-medium text-white">Linked servers</h2>
        </div>
        <div className="p-6 text-center text-sm text-white/40">No servers linked yet</div>
      </Card>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-5 mb-2">
      <PageTitle>Settings</PageTitle>
      <Card className="p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1.5">Username</label>
          <input className="w-full h-9 rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm text-white outline-none focus:border-white/20" defaultValue="username" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1.5">Email</label>
          <input className="w-full h-9 rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm text-white outline-none focus:border-white/20" defaultValue="user@example.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1.5">API Key</label>
          <div className="flex gap-2">
            <input readOnly className="flex-1 h-9 rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm font-mono text-white/60 outline-none" defaultValue="sotr_••••••••••••••••" />
            <button className="h-9 px-4 rounded-md border border-white/10 bg-white/[0.02] text-sm text-white/60 hover:text-white">Regenerate</button>
          </div>
        </div>
        <button className="h-9 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
          Save changes
        </button>
      </Card>
    </div>
  );
}
