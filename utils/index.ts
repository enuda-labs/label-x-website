export const planFeats = (plan: string) => {
  // Normalize plan name to lowercase for case-insensitive matching
  const normalizedPlan = plan.toLowerCase()

  switch (normalizedPlan) {
    case 'starter':
      return [
        'Up to 10,000 data points',
        '48-hour turnaround time',
        'Basic API access',
        'Email support',
      ]
    case 'teams':
      return [
        'Up to 50,000 data points',
        '24-hour turnaround time',
        'Full API access',
        'Priority support',
        'Custom reports',
        'Team collaboration',
      ]
    case 'pro':
      return [
        'Up to 50,000 data points',
        '24-hour turnaround time',
        'Full API access',
        'Priority support',
        'Custom reports',
      ]
    case 'enterprise':
      return [
        'Unlimited data points',
        '12-hour turnaround time',
        'Advanced API access',
        '24/7 dedicated support',
        'Custom integrations',
        'Team collaboration',
      ]
    default:
      return []
  }
}
