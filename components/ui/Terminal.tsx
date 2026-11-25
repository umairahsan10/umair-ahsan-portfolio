import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { projectGroups } from '../Projects';
import { experiences } from '../Experience';
import { skills } from '../Skills';
import { springs } from '../../lib/motion-tokens';

/*
 * Interactive terminal. Opens with Ctrl/⌘+K, `~` or `/` (or the navbar button,
 * which dispatches `terminal:open`). Every answer is read from the same data
 * the page renders, so the terminal can never drift from the site's content.
 */

/** Open the terminal, optionally running a command once it is up. */
export const openTerminal = (cmd?: string) =>
  window.dispatchEvent(new CustomEvent('terminal:open', { detail: { cmd } }));

const SEEN_KEY = 'terminal-seen';
export const terminalSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const EMAIL = 'umairahsan2019@gmail.com';
const GITHUB = 'https://github.com/umairahsan10';
const LINKEDIN = 'https://linkedin.com/in/umair-ahsan-650315250';
const SECTIONS = ['home', 'about', 'skills', 'experience', 'projects', 'achievements'];

const slug = (t: string) =>
  t
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const PROJECTS = projectGroups.flatMap((g) =>
  g.projects.map((p) => ({ ...p, slug: slug(p.title), group: g.label })),
);

const COMMANDS: { name: string; desc: string }[] = [
  { name: 'help', desc: 'list commands' },
  { name: 'whoami', desc: 'who is Umair' },
  { name: 'ls', desc: 'list sections · ls projects' },
  { name: 'cd', desc: 'jump to a section · cd projects' },
  { name: 'open', desc: 'open a project · open insurelink' },
  { name: 'experience', desc: 'work history' },
  { name: 'stack', desc: 'tech stack' },
  { name: 'contact', desc: 'email, GitHub, LinkedIn' },
  { name: 'resume', desc: 'open the CV (PDF)' },
  { name: 'theme', desc: 'switch theme · theme light' },
  { name: 'clear', desc: 'clear the screen' },
  { name: 'exit', desc: 'close the terminal' },
];

const CHIPS = ['sudo hire umair', 'help', 'whoami', 'ls projects', 'contact'];

/* Candidates for ghost-text completion */
const completions = (input: string): string[] => {
  const [cmd, ...rest] = input.split(' ');
  if (rest.length === 0) {
    return [...COMMANDS.map((c) => c.name), 'sudo hire umair', 'ls projects'].filter(
      (c) => c.startsWith(cmd) && c !== cmd,
    );
  }
  const arg = rest.join(' ');
  const pool =
    cmd === 'cd' ? SECTIONS : cmd === 'open' ? PROJECTS.map((p) => p.slug) : cmd === 'theme' ? ['dark', 'light'] : cmd === 'ls' ? ['projects'] : cmd === 'sudo' ? ['hire umair'] : [];
  return pool.filter((p) => p.startsWith(arg) && p !== arg).map((p) => `${cmd} ${p}`);
};

type Out = { id: number; node: React.ReactNode; cmd?: boolean };

const A: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel="noopener noreferrer"
    className="text-[var(--color-accent)] underline decoration-dotted underline-offset-4 hover:decoration-solid"
  >
    {children}
  </a>
);

const Dim: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-gray-500">{children}</span>
);

/* Scroll via a real anchor click so Lenis applies its header offset */
const goTo = (id: string) => {
  const a = document.createElement('a');
  a.href = `#${id}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const Terminal: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [out, setOut] = useState<Out[]>([]);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const returnFocus = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);
  const pendingCmd = useRef<string | null>(null);
  const runRef = useRef<(raw: string) => void>(() => {});

  const print = useCallback((node: React.ReactNode, cmd = false) => {
    setOut((prev) => [...prev, { id: idRef.current++, node, cmd }]);
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const close = useCallback(() => setOpen(false), []);

  /* Global shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
      if (open && e.key === 'Escape') {
        setOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (!typing && !open && (e.key === '`' || e.key === '~' || e.key === '/')) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = (e: Event) => {
      const cmd = (e as CustomEvent<{ cmd?: string }>).detail?.cmd;
      if (cmd && open) runRef.current(cmd);
      else if (cmd) pendingCmd.current = cmd;
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('terminal:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('terminal:open', onOpen);
    };
  }, [open]);

  /* Focus in, restore focus out, greet on first open */
  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      // Skip on touch: the soft keyboard would cover the command chips
      if (window.matchMedia('(hover: hover)').matches) setTimeout(() => inputRef.current?.focus(), 30);
      if (idRef.current === 0) {
        print(
          <Dim>
            Last login: {new Date().toDateString()} on ttys001
          </Dim>,
        );
        print(
          <span>
            Welcome to <span className="text-[var(--color-accent)]">umair.sh</span>. Type{' '}
            <span className="text-[var(--color-accent)]">help</span> to see what I can do, or tap a command below.
          </span>,
        );
      }
      const cmd = pendingCmd.current;
      pendingCmd.current = null;
      if (cmd) later(350, () => runRef.current(cmd));
      try {
        localStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* storage blocked: the hint simply stays */
      }
      window.dispatchEvent(new Event('terminal:seen'));
    } else {
      returnFocus.current?.focus?.();
    }
  }, [open, print, later]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [out]);

  const run = useCallback(
    (raw: string) => {
      const line = raw.trim();
      print(
        <span>
          <span className="text-[var(--color-accent)]">guest@umair</span>
          <Dim>:~$ </Dim>
          {line}
        </span>,
        true,
      );
      if (!line) return;
      history.current.unshift(line);
      histIdx.current = -1;

      const [cmd, ...args] = line.split(/\s+/);
      const arg = args.join(' ').toLowerCase();

      switch (cmd.toLowerCase()) {
        case 'help':
          print(
            <div className="grid grid-cols-[7.5rem_1fr] gap-x-3">
              {COMMANDS.map((c) => (
                <React.Fragment key={c.name}>
                  <span className="text-[var(--color-accent)]">{c.name}</span>
                  <Dim>{c.desc}</Dim>
                </React.Fragment>
              ))}
              <span className="text-[var(--color-accent)]">sudo …</span>
              <Dim>try it</Dim>
            </div>,
          );
          print(<Dim>tip: Tab or → autocompletes, ↑ ↓ walk history, Esc closes.</Dim>);
          break;

        case 'whoami':
          print(
            <div>
              <div>
                <span className="text-gray-900 dark:text-white font-semibold">Umair Ahsan</span>
                <Dim> · Backend &amp; AI-integrated apps engineer</Dim>
              </div>
              <div>
                Currently {experiences[0].role} at {experiences[0].company}.
              </div>
              <div className="mt-1">
                I design the backend that keeps enterprise platforms fast and safe: typed APIs, role-based access,
                caching, and LLM pipelines.
              </div>
            </div>,
          );
          break;

        case 'ls':
          if (arg.startsWith('project')) {
            print(
              <div>
                {projectGroups.map((g) => (
                  <div key={g.label} className="mb-1">
                    <Dim>{g.label.toLowerCase()}/</Dim>
                    {g.projects.map((p) => (
                      <div key={p.id} className="grid grid-cols-[minmax(0,11rem)_1fr] gap-x-3 pl-3">
                        <span className="text-[var(--color-accent)] truncate">{slug(p.title)}</span>
                        <Dim>
                          <span className="truncate block">{p.tech.slice(0, 3).join(' · ')}</span>
                        </Dim>
                      </div>
                    ))}
                  </div>
                ))}
                <Dim>run `open &lt;name&gt;` to launch one.</Dim>
              </div>,
            );
          } else {
            print(
              <div className="flex flex-wrap gap-x-5">
                {SECTIONS.filter((s) => s !== 'home').map((s) => (
                  <span key={s} className="text-[var(--color-accent)]">
                    {s}/
                  </span>
                ))}
                <span>resume.pdf</span>
              </div>,
            );
          }
          break;

        case 'cd': {
          const target = arg.replace(/\/$/, '') || 'home';
          const id = target === '~' || target === '..' ? 'home' : SECTIONS.find((s) => s.startsWith(target));
          if (!id) {
            print(<span>cd: no such directory: {target}</span>);
            break;
          }
          print(<Dim>→ /{id}</Dim>);
          later(250, () => {
            setOpen(false);
            later(120, () => goTo(id));
          });
          break;
        }

        case 'open': {
          if (!arg) {
            print(<span>usage: open &lt;project&gt; · try `ls projects`</span>);
            break;
          }
          const p = PROJECTS.find((x) => x.slug.startsWith(arg) || x.slug.includes(arg));
          if (!p) {
            print(<span>open: project not found: {arg}</span>);
            break;
          }
          print(
            <span>
              launching <span className="text-[var(--color-accent)]">{p.title}</span> <Dim>→ </Dim>
              <A href={p.link}>{p.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}</A>
            </span>,
          );
          window.open(p.link, '_blank', 'noopener');
          break;
        }

        case 'experience':
        case 'work':
          print(
            <div className="space-y-1">
              {experiences.map((e) => (
                <div key={e.id}>
                  <span className="text-gray-900 dark:text-white">{e.role}</span>
                  <Dim> @ </Dim>
                  <span className="text-[var(--color-accent)]">{e.company}</span>
                  <Dim> · {e.period}</Dim>
                </div>
              ))}
            </div>,
          );
          break;

        case 'stack':
        case 'skills':
          print(
            <div className="space-y-1">
              {skills.map((s) => (
                <div key={s.title}>
                  <span className="text-[var(--color-accent)]">{s.title.toLowerCase()}</span>
                  <Dim>: </Dim>
                  {s.skills.join(', ')}
                </div>
              ))}
            </div>,
          );
          break;

        case 'contact':
        case 'curl':
          print(
            <pre className="whitespace-pre-wrap font-mono">
              {'{\n  '}
              <Dim>"email"</Dim>
              {': '}
              <A href={`mailto:${EMAIL}`}>"{EMAIL}"</A>
              {',\n  '}
              <Dim>"github"</Dim>
              {': '}
              <A href={GITHUB}>"github.com/umairahsan10"</A>
              {',\n  '}
              <Dim>"linkedin"</Dim>
              {': '}
              <A href={LINKEDIN}>"in/umair-ahsan"</A>
              {',\n  '}
              <Dim>"status"</Dim>
              {': '}
              <span className="text-[var(--color-success)]">"available for hire"</span>
              {'\n}'}
            </pre>,
          );
          break;

        case 'resume':
        case 'cv':
        case 'cat':
          print(
            <span>
              opening <A href="/resume.pdf">resume.pdf</A>
            </span>,
          );
          window.open('/resume.pdf', '_blank', 'noopener');
          break;

        case 'theme': {
          const want = arg === 'light' || arg === 'dark' ? arg : theme === 'dark' ? 'light' : 'dark';
          if (want !== theme) toggleTheme();
          print(<Dim>theme → {want}</Dim>);
          break;
        }

        case 'clear':
          setOut([]);
          break;

        case 'exit':
        case 'quit':
          setOpen(false);
          break;

        case 'sudo':
          if (/^hire\s+umair/.test(arg)) {
            print(<Dim>[sudo] password for recruiter: ••••••••</Dim>);
            later(700, () => print(<span className="text-[var(--color-success)]">✓ access granted</span>));
            later(1300, () => print(<span>drafting email to Umair… opening your mail client</span>));
            later(2000, () => {
              window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's work together")}`;
            });
          } else {
            print(<span className="text-[var(--color-warn)]">guest is not in the sudoers file. This incident will be reported.</span>);
            print(<Dim>(hint: sudo hire umair)</Dim>);
          }
          break;

        case 'rm':
          print(<span className="text-[var(--color-warn)]">rm: permission denied. production is sacred.</span>);
          break;

        case 'ping':
          print(<span>pong · 1ms <Dim>(cache HIT)</Dim></span>);
          break;

        case 'echo':
          print(<span>{args.join(' ')}</span>);
          break;

        case 'date':
          print(<span>{new Date().toString()}</span>);
          break;

        default:
          print(
            <span>
              command not found: {cmd} <Dim>· try </Dim>
              <span className="text-[var(--color-accent)]">help</span>
            </span>,
          );
      }
    },
    [print, later, theme, toggleTheme],
  );

  runRef.current = run;

  const ghost = useMemo(() => (input ? completions(input)[0] ?? '' : ''), [input]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if ((e.key === 'Tab' || (e.key === 'ArrowRight' && el.selectionStart === input.length)) && ghost) {
      e.preventDefault();
      setInput(ghost);
    } else if (e.key === 'Tab') {
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx.current + 1, history.current.length - 1);
      if (next >= 0) {
        histIdx.current = next;
        setInput(history.current[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = histIdx.current - 1;
      histIdx.current = Math.max(next, -1);
      setInput(next >= 0 ? history.current[next] : '');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setOut([]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="terminal"
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          data-lenis-prevent
        >
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Interactive terminal"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={springs.snappy}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/40"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a,button')) return;
              if (!window.getSelection()?.toString() && window.matchMedia('(hover: hover)').matches) inputRef.current?.focus();
            }}
          >
            <div
              className="absolute -inset-px rounded-2xl pointer-events-none [background:radial-gradient(600px_circle_at_50%_0%,var(--color-accent-wash),transparent_60%)]"
              aria-hidden="true"
            />

            {/* Title bar */}
            <div className="relative flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-elevated)]">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="flex-1 text-center font-mono text-xs text-gray-500">guest@umair: ~</span>
              <button
                onClick={close}
                className="w-8 h-8 -mr-2 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close terminal"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Output */}
            <div
              ref={scrollRef}
              className="relative h-[46vh] sm:h-[360px] overflow-y-auto px-4 py-3 font-mono text-xs sm:text-[13px] leading-6 text-gray-800 dark:text-gray-200"
              aria-live="polite"
            >
              {out.map((o) => (
                <div key={o.id} className={`animate-[tipIn_160ms_ease-out] break-words ${o.cmd ? 'mt-2 first:mt-0' : ''}`}>
                  {o.node}
                </div>
              ))}

              {/* Prompt */}
              <label className="mt-2 flex items-center font-mono">
                <span className="sr-only">Command</span>
                <span className="text-[var(--color-accent)] shrink-0">guest@umair</span>
                <Dim>:~$&nbsp;</Dim>
                <span className="relative flex-1 min-w-0">
                  <span className="absolute inset-0 pointer-events-none whitespace-pre text-gray-400/60 dark:text-gray-600 overflow-hidden" aria-hidden="true">
                    <span className="invisible">{input}</span>
                    {ghost.slice(input.length)}
                  </span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      histIdx.current = -1;
                    }}
                    onKeyDown={onKeyDown}
                    className="relative w-full bg-transparent outline-none caret-[var(--color-accent)] text-gray-900 dark:text-white"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    aria-label="Terminal command"
                  />
                </span>
              </label>
            </div>

            {/* Quick commands, the main way in on touch devices */}
            <div className="relative flex gap-2 overflow-x-auto px-4 py-3 border-t border-[var(--color-border)] [scrollbar-width:none]">
              {CHIPS.map((c) =>
                c === 'sudo hire umair' ? (
                  /* The money command gets the same rotating border light as the hero CTA */
                  <button
                    key={c}
                    onClick={() => {
                      run(c);
                      if (window.matchMedia('(hover: hover)').matches) inputRef.current?.focus({ preventScroll: true });
                    }}
                    className="group relative shrink-0 inline-flex rounded-full p-px overflow-hidden cursor-pointer active:scale-[0.97] transition-transform shadow-[0_0_18px_-6px_var(--color-accent-glow)] hover:shadow-[0_0_24px_-4px_var(--color-accent-glow)]"
                  >
                    <span
                      className="absolute inset-[-200%] cta-spin [background:conic-gradient(from_0deg,transparent_0%,transparent_65%,var(--color-accent)_85%,transparent_100%)]"
                      aria-hidden="true"
                    />
                    <span className="absolute inset-0 rounded-full border border-[var(--color-border)]" aria-hidden="true" />
                    <span className="relative rounded-full bg-[var(--color-card)] px-3 py-1.5 font-mono text-[11px] text-[var(--color-accent)] group-hover:bg-[var(--color-elevated)] transition-colors">
                      {c}
                    </span>
                  </button>
                ) : (
                <button
                  key={c}
                  onClick={() => {
                    run(c);
                    if (window.matchMedia('(hover: hover)').matches) inputRef.current?.focus({ preventScroll: true });
                  }}
                  className="shrink-0 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-mono text-[11px] text-gray-600 dark:text-gray-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  {c}
                </button>
                ),
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
