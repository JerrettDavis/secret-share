/**
 * Turn a raw User-Agent header into something a human can scan in an access
 * log — e.g. `"Chrome 141 on macOS"`.
 *
 * Deliberately conservative: if the string is not confidently recognised as a
 * mainstream browser it is returned **unchanged**. An access log entry reading
 * `curl/8.7.1` is far more useful to the person auditing their secret than a
 * guess like "Unknown browser on Unknown OS".
 */

interface Rule {
  name: string;
  /** Must capture the major version in group 1. */
  re: RegExp;
  /** Other tokens that, if present, mean this is actually a different browser. */
  notIf?: RegExp;
}

// Order matters: the more specific forks come before Chrome/Safari.
const BROWSERS: Rule[] = [
  { name: 'Edge', re: /\bEdg(?:e|A|iOS)?\/(\d+)/ },
  { name: 'Opera', re: /\bOPR\/(\d+)/ },
  { name: 'Opera', re: /\bOpera\/.*\bVersion\/(\d+)/ },
  { name: 'Vivaldi', re: /\bVivaldi\/(\d+)/ },
  { name: 'Brave', re: /\bBrave\/(\d+)/ },
  { name: 'Samsung Internet', re: /\bSamsungBrowser\/(\d+)/ },
  { name: 'Firefox', re: /\b(?:Firefox|FxiOS)\/(\d+)/ },
  {
    name: 'Chrome',
    re: /\b(?:Chrome|CriOS)\/(\d+)/,
    notIf: /\bEdg|\bOPR\/|\bVivaldi\/|\bSamsungBrowser\/|\bBrave\//,
  },
  {
    name: 'Safari',
    re: /\bVersion\/(\d+)[.\d]*\s+(?:Mobile\/\S+\s+)?Safari\//,
    notIf: /\bChrome\/|\bChromium\/|\bOPR\//,
  },
];

interface OsRule {
  re: RegExp;
  label: string | ((m: RegExpMatchArray) => string);
}

const OSES: OsRule[] = [
  { re: /\bWindows NT 10\.0/, label: 'Windows' },
  { re: /\bWindows NT 6\.3/, label: 'Windows 8.1' },
  { re: /\bWindows NT 6\.1/, label: 'Windows 7' },
  { re: /\bWindows/, label: 'Windows' },
  { re: /\biPhone|\biPod/, label: 'iOS' },
  { re: /\biPad/, label: 'iPadOS' },
  { re: /\bMac OS X|\bMacintosh/, label: 'macOS' },
  { re: /\bAndroid\s+(\d+)/, label: (m) => `Android ${m[1]}` },
  { re: /\bAndroid/, label: 'Android' },
  { re: /\bCrOS/, label: 'ChromeOS' },
  { re: /\bUbuntu/, label: 'Ubuntu' },
  { re: /\bLinux/, label: 'Linux' },
];

/**
 * @returns `"Chrome 141 on macOS"` when both browser and OS are recognised,
 *          `"Firefox 128"` when only the browser is, and the untouched input
 *          string in every other case (including empty input).
 */
export function formatUserAgent(ua: string): string {
  if (!ua || !ua.trim()) return ua;

  let browser: string | null = null;
  for (const rule of BROWSERS) {
    if (rule.notIf && rule.notIf.test(ua)) continue;
    const m = ua.match(rule.re);
    if (m) {
      browser = `${rule.name} ${m[1]}`;
      break;
    }
  }
  if (!browser) return ua;

  let os: string | null = null;
  for (const rule of OSES) {
    const m = ua.match(rule.re);
    if (m) {
      os = typeof rule.label === 'function' ? rule.label(m) : rule.label;
      break;
    }
  }

  return os ? `${browser} on ${os}` : browser;
}

export default formatUserAgent;
