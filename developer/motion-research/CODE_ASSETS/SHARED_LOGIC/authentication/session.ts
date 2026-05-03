/**
 * The session cookie expires after 10 days. Note that this is the max value
 * that firebase will allow (firebase says 14 days, but will throw an error for
 * any value over 10 days). This is only applicable when the user is inactive
 * for more than 10 days - the frontend will automatically refresh the session
 * cookie (through calling `on-login` on refresh or manually triggered) to
 * extend the session.
 */
export const SessionExpiryMs = 60 * 60 * 24 * 10 * 1_000
