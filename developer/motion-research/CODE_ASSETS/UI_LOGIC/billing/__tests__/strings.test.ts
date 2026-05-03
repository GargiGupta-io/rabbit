import { type BillingPrices } from '../constants'
import {
  generateBillingFormula,
  type GenerateBillingFormulaProps,
  makeTeamBillingStr,
  type makeTeamBillingStrProps,
  makeTeamResubscribeCtaStr,
  makeTeamTrialOnIndividualBillingTermsStr,
} from '../strings'

const TEST_TEAM_PRICES: BillingPrices = {
  annualPrice: 144,
  monthlyPrice: 20,
  annualPricePerMonth: 12,
  annualSavingsPercent: 40,
  annualSavingsPercentInteger: 40,
}

describe('generateBillingFormula', () => {
  const testCases: {
    name: string
    wantString: string
    props: GenerateBillingFormulaProps
  }[] = [
    {
      name: 'properly formats monthly individual price',
      wantString: '$34 per month',
      props: { isAnnual: false, monthlyPrice: 34, showSeats: false },
    },
    {
      name: 'properly formats annual individual price',
      wantString: '$19/mo x 12 months = $228/year',
      props: { isAnnual: true, monthlyPrice: 19, showSeats: false },
    },
    {
      name: 'properly formats annual team price',
      wantString: '$12/mo x 5 seats x 12 months = $720/year',
      props: { isAnnual: true, seats: 5, monthlyPrice: 12, showSeats: true },
    },
    {
      name: 'properly formats monthly team price',
      wantString: '$20/mo x 5 seats = $100/month',
      props: { isAnnual: false, seats: 5, monthlyPrice: 20, showSeats: true },
    },
  ]

  test.each(testCases)('$name', ({ wantString, props }) => {
    expect(generateBillingFormula(props)).toEqual(wantString)
  })
})

describe('makeTeamBillingStr', () => {
  const testCases: {
    name: string
    wantString: string
    props: Omit<makeTeamBillingStrProps, 'teamPrices'>
  }[] = [
    {
      name: 'Annual seats',
      wantString:
        "You'll be charged $12/mo per seat ($720/year) billed annually.",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Annual seats with applicable tax',
      wantString:
        "You'll be charged $12/mo per seat ($720/year) billed annually (plus applicable taxes).",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: true,
      },
    },
    {
      name: 'Monthly seats',
      wantString: "You'll be charged $20/mo per seat billed monthly.",
      props: {
        isAnnual: false,
        quantity: 1,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Basic tier monthly seats',
      wantString: "You'll be charged $20/mo per seat billed monthly.",
      props: {
        isAnnual: false,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
        tierTeamPrices: {
          annualPricePerMonth: 12,
          monthlyPrice: 20,
          annualPrice: 144,
          annualSavingsPercent: 40,
          annualSavingsPercentInteger: 40,
        },
      },
    },
    {
      name: 'Basic tier annual seats',
      wantString:
        "You'll be charged $12/mo per seat ($720/year) billed annually.",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
        tierTeamPrices: {
          annualPricePerMonth: 12,
          monthlyPrice: 20,
          annualPrice: 144,
          annualSavingsPercent: 40,
          annualSavingsPercentInteger: 40,
        },
      },
    },
    {
      name: 'Pro tier monthly seats',
      wantString: "You'll be charged $42/mo per seat billed monthly.",
      props: {
        isAnnual: false,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
        tierTeamPrices: {
          annualPricePerMonth: 25,
          monthlyPrice: 42,
          annualPrice: 1500,
          annualSavingsPercent: 40,
          annualSavingsPercentInteger: 40,
        },
      },
    },
    {
      name: 'Pro tier annual seats',
      wantString:
        "You'll be charged $25/mo per seat ($1,500/year) billed annually.",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
        tierTeamPrices: {
          annualPricePerMonth: 25,
          monthlyPrice: 42,
          annualPrice: 300,
          annualSavingsPercent: 40,
          annualSavingsPercentInteger: 40,
        },
      },
    },
    {
      name: 'Pro AI tier monthly seats',
      wantString: "You'll be charged $82/mo per seat billed monthly.",
      props: {
        isAnnual: false,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
        tierTeamPrices: {
          annualPricePerMonth: 49,
          monthlyPrice: 82,
          annualPrice: 588,
          annualSavingsPercent: 40,
          annualSavingsPercentInteger: 40,
        },
      },
    },
    {
      name: 'Pro AI tier annual seats',
      wantString:
        "You'll be charged $49/mo per seat ($2,940/year) billed annually.",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        shouldShowSalesTaxMessage: false,
        tierTeamPrices: {
          annualPricePerMonth: 49,
          monthlyPrice: 82,
          annualPrice: 588,
          annualSavingsPercent: 40,
          annualSavingsPercentInteger: 40,
        },
      },
    },
    {
      name: 'Annual users',
      wantString:
        "You'll be charged $12/mo per user ($432/year) billed annually.",
      props: {
        isAnnual: true,
        quantity: 3,
        isSeats: false,
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Monthly users',
      wantString: "You'll be charged $20/mo per user billed monthly.",
      props: {
        isAnnual: false,
        quantity: 1,
        isSeats: false,
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Trial proration text',
      wantString:
        "You'll be charged $12/mo per seat ($720/year) billed annually after your trial ends.",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        prorationTextParams: {
          isTrial: true,
        },
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Downgrade proration text',
      wantString:
        "You'll be charged $12/mo per seat ($720/year) billed annually. This new price will take effect on your next invoice (Mar 05, 2024).",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        prorationTextParams: {
          isTrial: false,
          downgradeDate: 'Mar 05, 2024',
        },
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Upgrade proration text annual',
      wantString:
        "You'll be charged $12/mo per seat ($720/year) billed annually. The first year amount will be pro-rated starting today.",
      props: {
        isAnnual: true,
        quantity: 5,
        isSeats: true,
        prorationTextParams: {
          isTrial: false,
        },
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Upgrade proration text monthly',
      wantString:
        "You'll be charged $20/mo per seat billed monthly. The first month amount will be pro-rated starting today.",
      props: {
        isAnnual: false,
        quantity: 5,
        isSeats: true,
        prorationTextParams: {
          isTrial: false,
        },
        shouldShowSalesTaxMessage: false,
      },
    },
    {
      name: 'Upgrade proration text monthly with applicable tax',
      wantString:
        "You'll be charged $20/mo per seat billed monthly (plus applicable taxes). The first month amount will be pro-rated starting today.",
      props: {
        isAnnual: false,
        quantity: 5,
        isSeats: true,
        prorationTextParams: {
          isTrial: false,
        },
        shouldShowSalesTaxMessage: true,
      },
    },
  ]

  test.each(testCases)('$name', ({ wantString, props }) => {
    expect(
      makeTeamBillingStr({ ...props, teamPrices: TEST_TEAM_PRICES })
    ).toEqual(wantString)
  })
})

describe('makeTeamResubscribeCtaStr', () => {
  it('properly formats with team size greater than 1', () => {
    expect(makeTeamResubscribeCtaStr(5)).toEqual(
      '5 of your team members have lost access to Motion. Re-subscribe to a team plan!'
    )
  })

  it('properly formats with team size equal to 1', () => {
    expect(makeTeamResubscribeCtaStr(1)).toEqual(
      'Your team members have lost access to Motion. Re-subscribe to a team plan!'
    )
  })
})

describe('makeTeamTrialOnIndividualBillingTermsStr', () => {
  it('properly formats annual with multiple days left', () => {
    expect(
      makeTeamTrialOnIndividualBillingTermsStr(12, true, 'Mar 05, 2024', 12)
    ).toEqual(
      "You'll be charged $12 when your trial ends on Mar 05, 2024 (in 12 days). Any remaining balance on your Individual Plan will be credited to your Team Plan. After that you'll be charged $12 annually and your plan will be upgraded from Individual to Team!"
    )
  })

  it('properly formats monthly with one day left', () => {
    expect(
      makeTeamTrialOnIndividualBillingTermsStr(12, false, 'Mar 05, 2024', 1)
    ).toEqual(
      "You'll be charged $12 when your trial ends on Mar 05, 2024 (in 1 day). Any remaining balance on your Individual Plan will be credited to your Team Plan. After that you'll be charged $12 monthly and your plan will be upgraded from Individual to Team!"
    )
  })
})
