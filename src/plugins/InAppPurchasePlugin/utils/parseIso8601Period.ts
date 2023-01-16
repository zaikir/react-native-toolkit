const androidPeriods = {
  D: 'day',
  W: 'week',
  M: 'month',
  Y: 'year',
};

export function parseIso8601Period(period: string) {
  return {
    // @ts-ignore
    periodUnit: androidPeriods[period.charAt(2)],
    numberOfPeriods: parseInt(period.charAt(1), 10),
  } as {
    periodUnit: 'day' | 'week' | 'month' | 'year',
    numberOfPeriods: number
  };
}
