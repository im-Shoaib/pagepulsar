// URL validation and SSRF protection for user-supplied addresses.

const BLOCKED_HOSTS = /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.lan|.*\.home|.*\.corp|metadata\.google\.internal)$/i;

function ipv4Private(h) {
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function ipv6Blocked(h) {
  const v = h.replace(/^\[|\]$/g, "").toLowerCase();
  if (!v.includes(":")) return false;
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb") || v.startsWith("::ffff:");
}

// Returns a normalised URL string, or throws an Error with code "invalid_url".
export function checkUrl(raw) {
  let s = String(raw || "").trim();
  if (!s || s.length > 2000) throw codeError("invalid_url");
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "https://" + s;
  let u;
  try { u = new URL(s); } catch { throw codeError("invalid_url"); }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw codeError("invalid_url");
  if (u.username || u.password) throw codeError("invalid_url");
  if (u.port && u.port !== "80" && u.port !== "443") throw codeError("invalid_url");
  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.test(host) || ipv4Private(host) || ipv6Blocked(host)) throw codeError("invalid_url");
  if (/^[\d.]+$/.test(host)) throw codeError("invalid_url"); // bare IP addresses aren't business websites
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(host) && !host.startsWith("xn--")) throw codeError("invalid_url");
  u.hash = "";
  return u.toString();
}

export function codeError(code, message) {
  const e = new Error(message || code);
  e.code = code;
  return e;
}
