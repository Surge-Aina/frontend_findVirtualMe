/**
 * Hosts that render the main FindVirtual site instead of a customer portfolio.
 * VITE_PLATFORM_HOSTS is an optional comma-separated list (exact hosts or
 * `*.suffix` patterns) merged onto these defaults. staging.findvirtual.me is
 * not a platform host.
 */
export const DEFAULT_PLATFORM_HOSTS = [
  'findvirtual.me',
  'www.findvirtual.me',
  'localhost',
  '127.0.0.1',
  '*.vercel.app',
];

const FINDVIRTUAL_APEX = 'findvirtual.me';

export function normalizeHostname(hostname) {
  return String(hostname ?? '')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
}

export function parsePlatformHosts(platformHostsEnv) {
  const extras =
    typeof platformHostsEnv === 'string'
      ? platformHostsEnv
          .split(',')
          .map((entry) => entry.trim().toLowerCase())
          .filter(Boolean)
      : [];
  return [...new Set([...DEFAULT_PLATFORM_HOSTS, ...extras])];
}

export function hostnameMatchesPattern(hostname, pattern) {
  const host = normalizeHostname(hostname);
  const normalized = normalizeHostname(pattern);
  if (!host || !normalized) return false;

  if (normalized.startsWith('*.')) {
    const suffix = normalized.slice(1);
    if (suffix.length < 2 || !suffix.startsWith('.')) return false;
    return host.endsWith(suffix) && host.length > suffix.length;
  }

  return host === normalized;
}

export function isPlatformHost(hostname, platformHostsEnv) {
  return parsePlatformHosts(platformHostsEnv).some((pattern) =>
    hostnameMatchesPattern(hostname, pattern)
  );
}

/** `{slug}.findvirtual.me`, excluding apex and configured platform hosts such as www. */
export function isFindVirtualPortfolioSubdomain(hostname, platformHostsEnv) {
  const host = normalizeHostname(hostname);
  if (!host.endsWith(`.${FINDVIRTUAL_APEX}`)) return false;
  if (isPlatformHost(host, platformHostsEnv)) return false;
  return true;
}

/**
 * @returns {'platform' | 'portfolio-subdomain' | 'custom-domain'}
 */
export function classifyHost(hostname, platformHostsEnv) {
  if (isPlatformHost(hostname, platformHostsEnv)) return 'platform';
  if (isFindVirtualPortfolioSubdomain(hostname, platformHostsEnv)) {
    return 'portfolio-subdomain';
  }
  return 'custom-domain';
}
