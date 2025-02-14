import type { NextRequest } from 'next/server';
import { match as pathMatch } from 'path-to-regexp';

/**
 * Allowed literal types for matcher conditions.
 */
export type AllowedMatcherType = 'header' | 'query' | 'cookie';

/**
 * Matcher element type.
 * It accepts either an object with a literal type (one of AllowedMatcherType)
 * or an object with a general string, so that object literals without assertions work.
 */
export type MatcherElement =
  | { type: AllowedMatcherType; key: string; value?: string }
  | { type: string; key: string; value?: string };

/**
 * Interface for a matcher condition object.
 */
export interface MatcherCondition {
  source: string;
  regexp?: string;
  locale?: boolean;
  has?: MatcherElement[];
  missing?: MatcherElement[];
}

/**
 * Matcher can be a string, a MatcherCondition object, or an array of these.
 */
export type Matcher = string | MatcherCondition | (string | MatcherCondition)[];

/**
 * Cache for compiled path-to-regexp matching functions.
 */
const matcherCache = new Map<string, ReturnType<typeof pathMatch>>();

/**
 * Cache for compiled regular expressions.
 */
const regexCache = new Map<string, RegExp>();

/**
 * Returns the matching function for a given pattern using caching.
 * @param pattern - The path pattern to compile.
 */
function getMatcherFunction(pattern: string) {
  if (matcherCache.has(pattern)) {
    return matcherCache.get(pattern)!;
  }
  const fn = pathMatch(pattern, { decode: decodeURIComponent });
  matcherCache.set(pattern, fn);
  return fn;
}

/**
 * Returns the compiled regular expression for a given regex string using caching.
 * @param regexStr - The regular expression string.
 */
function getRegex(regexStr: string): RegExp {
  if (regexCache.has(regexStr)) return regexCache.get(regexStr)!;
  const re = new RegExp(regexStr);
  regexCache.set(regexStr, re);
  return re;
}

/**
 * Checks if a given path matches the pattern.
 * @param path - The path to test.
 * @param pattern - The pattern to match.
 */
function matchPath(path: string, pattern: string): boolean {
  const matcherFn = getMatcherFunction(pattern);
  return matcherFn(path) !== false;
}

/**
 * Checks if the "has" conditions are met in the request.
 * @param req - The NextRequest object.
 * @param conditions - Array of matcher element conditions.
 */
function checkHasConditions(
  req: NextRequest,
  conditions: readonly MatcherElement[],
): boolean {
  for (const condition of conditions) {
    switch (condition.type) {
      case 'header': {
        const headerValue = req.headers.get(condition.key);
        if (headerValue === null) return false;
        if (condition.value !== undefined && headerValue !== condition.value)
          return false;
        break;
      }
      case 'query': {
        const queryValue = req.nextUrl.searchParams.get(condition.key);
        if (queryValue === null) return false;
        if (condition.value !== undefined && queryValue !== condition.value)
          return false;
        break;
      }
      case 'cookie': {
        const cookie = req.cookies.get(condition.key);
        if (!cookie) return false;
        if (condition.value !== undefined && cookie.value !== condition.value)
          return false;
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

/**
 * Checks if the "missing" conditions are met in the request.
 * Conditions are satisfied if the specified request element is absent
 * or does not match the provided value.
 * @param req - The NextRequest object.
 * @param conditions - Array of matcher element conditions.
 */
function checkMissingConditions(
  req: NextRequest,
  conditions: readonly MatcherElement[],
): boolean {
  for (const condition of conditions) {
    switch (condition.type) {
      case 'header': {
        const headerValue = req.headers.get(condition.key);
        if (headerValue !== null) {
          if (condition.value === undefined || headerValue === condition.value)
            return false;
        }
        break;
      }
      case 'query': {
        const queryValue = req.nextUrl.searchParams.get(condition.key);
        if (queryValue !== null) {
          if (condition.value === undefined || queryValue === condition.value)
            return false;
        }
        break;
      }
      case 'cookie': {
        const cookie = req.cookies.get(condition.key);
        if (cookie) {
          if (condition.value === undefined || cookie.value === condition.value)
            return false;
        }
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

/**
 * Checks if the request matches the given matcher condition.
 * @param req - The NextRequest object.
 * @param condition - The matcher condition object.
 */
export function matchMatcherCondition(
  req: NextRequest,
  condition: MatcherCondition,
): boolean {
  // Adjust the path based on locale configuration.
  let pathToMatch = req.nextUrl.pathname;
  if (condition.locale === false && req.nextUrl.locale) {
    const localePrefix = '/' + req.nextUrl.locale;
    if (pathToMatch.startsWith(localePrefix)) {
      pathToMatch = pathToMatch.slice(localePrefix.length) || '/';
    }
  }
  // Check the "source" pattern using path-to-regexp.
  if (!matchPath(pathToMatch, condition.source)) {
    return false;
  }
  // If a regexp is provided, test it against the path.
  if (condition.regexp) {
    const re = getRegex(condition.regexp);
    if (!re.test(pathToMatch)) {
      return false;
    }
  }
  // Check "has" conditions.
  if (condition.has && !checkHasConditions(req, condition.has)) {
    return false;
  }
  // Check "missing" conditions.
  if (condition.missing && !checkMissingConditions(req, condition.missing)) {
    return false;
  }
  return true;
}

/**
 * Checks if the request matches the provided matcher configuration.
 * @param req - The NextRequest object.
 * @param matcher - The matcher configuration.
 */
export function matchRequest(req: NextRequest, matcher?: Matcher): boolean {
  if (!matcher) return true;
  const matchers = Array.isArray(matcher) ? matcher : [matcher];

  // The request matches if it satisfies at least one of the matchers.
  for (const m of matchers) {
    if (typeof m === 'string') {
      if (matchPath(req.nextUrl.pathname, m)) {
        return true;
      }
    } else {
      if (matchMatcherCondition(req, m)) {
        return true;
      }
    }
  }
  return false;
}
