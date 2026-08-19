import { Resend } from "resend";

/**
 * Shared Resend client instance.
 *
 * Requires RESEND_API_KEY in environment variables.
 * Sign up and get your key at https://resend.com
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * The "from" address for all CloudLens emails.
 *
 * During development: use the Resend test address "onboarding@resend.dev"
 * In production: set EMAIL_FROM to your verified domain address, e.g.:
 *   EMAIL_FROM="CloudLens <noreply@yourdomaim.com>"
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "CloudLens <onboarding@resend.dev>";
