import { templateStr } from '@motion/react-core/strings'

import { type BillingPrices, MAX_SELF_SERVE_TEAM_SIZE } from './constants'

import { formattedCurrencyAmount } from '../utils/string/currency-utils'

const formatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})
const wholeDollarFormatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
})

export const formatPriceStr = (
  price: number,
  allowWholeDollar: boolean = false
): string => {
  // If less than 1 dollar, show as cents
  if (price < 1) {
    return `${Math.round(price * 100)} cents`
  }

  if (allowWholeDollar && price % 1 === 0) {
    return wholeDollarFormatter.format(price)
  }
  return formatter.format(price)
}

/**
 * @deprecated Use formatPriceStr if possible
 */
export const formatPrice = (price: number, decimals = 0) => {
  return Math.round(price * 10 ** decimals) / 10 ** decimals
}

export type GenerateBillingFormulaProps = {
  isAnnual: boolean
  seats?: number
  monthlyPrice: number
  showSeats: boolean
}

export function generateBillingFormula({
  isAnnual,
  seats,
  monthlyPrice,
  showSeats = true,
}: GenerateBillingFormulaProps): string {
  if (seats && showSeats) {
    if (isAnnual) {
      return `$${formatPrice(monthlyPrice, 2)}/mo x ${seats} ${
        seats === 1 ? 'seat' : 'seats'
      } x 12 months = $${formatPrice(seats * monthlyPrice * 12, 2)}/year`
    }
    return `$${formatPrice(monthlyPrice, 2)}/mo x ${seats} ${
      seats === 1 ? 'seat' : 'seats'
    } = $${formatPrice(seats * monthlyPrice, 2)}/month`
  }

  const roundedPrice = formatPrice(monthlyPrice * (seats ?? 1))

  if (isAnnual) {
    return `$${roundedPrice}/mo x 12 months = $${roundedPrice * 12}/year`
  }
  return `$${roundedPrice} per month`
}

export type makeTeamBillingStrProps = {
  isAnnual: boolean
  quantity: number
  isSeats?: boolean
  prorationTextParams?: prorationTextParams
  /**
   * @deprecated Use tierTeamPrices instead
   */
  teamPrices: BillingPrices
  tierTeamPrices?: BillingPrices
  shouldShowSalesTaxMessage: boolean
}

type prorationTextParams = {
  isTrial: boolean
  downgradeDate?: string
}

const makeProrationText = (isAnnual: boolean, params?: prorationTextParams) => {
  if (!params) {
    return '.'
  } else if (params.isTrial) {
    return ' after your trial ends.'
  } else if (params.downgradeDate) {
    return `. This new price will take effect on your next invoice (${params.downgradeDate}).`
  }
  return `. The first ${
    isAnnual ? 'year' : 'month'
  } amount will be pro-rated starting today.`
}

export function makeTeamBillingStr({
  isAnnual,
  quantity,
  isSeats,
  prorationTextParams,
  teamPrices,
  tierTeamPrices,
  shouldShowSalesTaxMessage,
}: makeTeamBillingStrProps): string {
  return templateStr(
    "You'll be charged {{formattedMonthlyPrice}}/mo per {{seatOrUser}} {{annualPrice}}billed {{interval}}{{applicableTax}}{{prorationText}}",
    {
      formattedMonthlyPrice: formattedCurrencyAmount(
        isAnnual
          ? (tierTeamPrices?.annualPricePerMonth ??
              teamPrices.annualPricePerMonth)
          : (tierTeamPrices?.monthlyPrice ?? teamPrices.monthlyPrice),
        'USD',
        true
      ),
      seatOrUser: isSeats ? 'seat' : 'user',
      annualPrice: isAnnual
        ? `(${formattedCurrencyAmount(
            (tierTeamPrices?.annualPrice ?? teamPrices.annualPrice) * quantity,
            'USD',
            true
          )}/year) `
        : '',
      interval: isAnnual ? 'annually' : 'monthly',
      prorationText: makeProrationText(isAnnual, prorationTextParams),
      applicableTax: shouldShowSalesTaxMessage
        ? ' (plus applicable taxes)'
        : '',
    }
  )
}

export function makeTeamResubscribeCtaStr(numSeats: number) {
  if (numSeats > 1) {
    return `${numSeats} of your team members have lost access to Motion. Re-subscribe to a team plan!`
  }

  return 'Your team members have lost access to Motion. Re-subscribe to a team plan!'
}

export const teamElevatorPitch = `Supports teams of less than ${MAX_SELF_SERVE_TEAM_SIZE} users`

export function makeTeamBullets(savings = 0) {
  return [
    ...teamBullets,
    ...(savings > 0
      ? [`${savings}% cheaper than individual plan per seat`]
      : []),
  ]
}

export const teamBulletsShort = [
  'Automatically compute the optimal daily plan for each team member across dozens of projects.',
  'Ensure every team member is always working on the most critical and urgent work.',
  'Full visibility and transparency on what everyone is working on with Team Schedule.',
  'Automate resource and capacity planning.',
  'Active warnings when projects are at-risk of missing deadlines.',
  'Predict exactly when every task and project will be completed.',
  'Automatically redo planning when things change.',
  'Automate Standard Operating Procedures with Project Workflow Automation Templates.',
  'Replaces Monday, ClickUp, Asana, Notion, Airtable, Excel...etc.',
  'SOC 2 Type 2 Compliant. Security Report available.',
]

export const teamBullets = [
  'Manage Team Projects and Tasks',
  'AI Project Manager - Coordination and Optimization',
  'Project Workflow Automations',
  'Team Progress Tracking',
  'Team Productivity Dashboards',
  'Gantt Chart',
  'SOP (Standard Operating Procedure) Templates & Automations',
  'Collaboration Features',
  'Project ETA Alerts',
  'Centralized Billing',
  'Priority Customer Support',
]

export const individualElevatorPitch = 'Supports 1 user'

export const individualBullets = [
  'AI Planning Agent',
  'AI Task Creation',
  'Auto Task Prioritization',
  'Next-Gen Calendar',
  'Time Tracking',
  'Deadline ETA Alerts',
  'Focus and Deep Work Time',
  'Connect all Personal and Work Calendars',
  'Integration with Outlook, Google, and iCloud',
  'Booking links',
  'Web app, Desktop app, Mobile app',
]

export const enterpriseBullets = [
  'Unlimited Storage',
  'Data Restore Service & Regular Data Backup',
  'Security Reports & Completing Questionnaires',
  'Dedicated Implementation Solutions Architect',
  'Dedicated Customer Success Manager',
]

export const enterpriseElevatorPitch = `Supports teams of ${MAX_SELF_SERVE_TEAM_SIZE} users or more`

export const makeTeamTrialOnIndividualBillingTermsStr = (
  price: number,
  isAnnual: boolean,
  trialEnd: string,
  trialDays: number
) => {
  return templateStr(
    "You'll be charged ${{price}} when your trial ends on {{trialEnd}} (in {{dayPlural}}). Any remaining balance on your Individual Plan will be credited to your Team Plan. After that you'll be charged ${{price}} {{interval}} and your plan will be upgraded from Individual to Team!",
    {
      price,
      interval: isAnnual ? 'annually' : 'monthly',
      trialEnd,
      dayPlural: `${trialDays} day${trialDays === 1 ? '' : 's'}`,
    }
  )
}
