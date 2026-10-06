// Real mathematical calculations for StudentToolBox calculators

export function calculateAttendance(attended: number, total: number, requiredPercentage = 75) {
  if (total <= 0) {
    return {
      currentPercentage: 0,
      status: 'insufficient_data',
      message: 'Total classes must be greater than zero.',
      classesNeeded: 0,
      classesCanMiss: 0,
    };
  }

  const currentPercentage = (attended / total) * 100;
  const req = requiredPercentage;

  if (currentPercentage >= req) {
    // Current is greater than or equal to requirement
    // Formula: attended / (total + y) >= req / 100 => 100 * attended >= req * total + req * y => y = floor((100 * attended - req * total) / req)
    const canMiss = Math.floor((100 * attended - req * total) / req);
    return {
      currentPercentage: Number(currentPercentage.toFixed(2)),
      status: 'safe',
      message: `Your attendance is safe at ${currentPercentage.toFixed(1)}%! You can afford to miss up to ${canMiss} upcoming class${canMiss === 1 ? '' : 'es'} while maintaining at least ${req}%.`,
      classesNeeded: 0,
      classesCanMiss: Math.max(0, canMiss),
    };
  } else {
    // Current is below requirement
    // Formula: (attended + x) / (total + x) >= req / 100 => 100 * attended + 100 * x >= req * total + req * x
    // x * (100 - req) >= req * total - 100 * attended => x = ceil((req * total - 100 * attended) / (100 - req))
    if (req >= 100) {
      return {
        currentPercentage: Number(currentPercentage.toFixed(2)),
        status: 'danger',
        message: 'A 100% attendance requirement is impossible to reach once a class has been missed.',
        classesNeeded: 999,
        classesCanMiss: 0,
      };
    }
    const needed = Math.ceil((req * total - 100 * attended) / (100 - req));
    return {
      currentPercentage: Number(currentPercentage.toFixed(2)),
      status: 'danger',
      message: `Your attendance is currently ${currentPercentage.toFixed(1)}% (below ${req}%). You must attend the next ${needed} consecutive class${needed === 1 ? '' : 'es'} to reach ${req}%.`,
      classesNeeded: Math.max(0, needed),
      classesCanMiss: 0,
    };
  }
}

export interface CourseGrade {
  id: string;
  name: string;
  credits: number;
  gradePoints: number; // e.g. 4.0 for A
}

export function calculateGPA(courses: CourseGrade[]) {
  const validCourses = courses.filter((c) => c.credits > 0 && !isNaN(c.gradePoints));
  if (validCourses.length === 0) {
    return { gpa: 0, totalCredits: 0, totalGradePoints: 0 };
  }

  const totalCredits = validCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePoints = validCourses.reduce((sum, c) => sum + c.credits * c.gradePoints, 0);
  const gpa = totalGradePoints / totalCredits;

  return {
    gpa: Number(gpa.toFixed(2)),
    totalCredits,
    totalGradePoints: Number(totalGradePoints.toFixed(2)),
  };
}

export function calculateCGPA(
  previousCgpa: number,
  previousCredits: number,
  currentGpa: number,
  currentCredits: number
) {
  const totalCredits = previousCredits + currentCredits;
  if (totalCredits <= 0) return 0;
  const totalPoints = previousCgpa * previousCredits + currentGpa * currentCredits;
  return Number((totalPoints / totalCredits).toFixed(2));
}

export function calculateTargetGPA(
  currentCgpa: number,
  completedCredits: number,
  targetCgpa: number,
  remainingCredits: number
) {
  if (remainingCredits <= 0) return null;
  const totalCredits = completedCredits + remainingCredits;
  const targetTotalPoints = targetCgpa * totalCredits;
  const currentTotalPoints = currentCgpa * completedCredits;
  const neededPoints = targetTotalPoints - currentTotalPoints;
  const requiredGpa = neededPoints / remainingCredits;
  return Number(requiredGpa.toFixed(2));
}

// Percentages
export function calculatePercentOf(percent: number, total: number) {
  return (percent / 100) * total;
}

export function calculateWhatPercent(part: number, whole: number) {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

export function calculatePercentChange(oldValue: number, newValue: number) {
  if (oldValue === 0) return 0;
  const change = ((newValue - oldValue) / oldValue) * 100;
  return Number(change.toFixed(2));
}

// Statistics
export function calculateStatistics(numbers: number[]) {
  if (numbers.length === 0) {
    return { mean: 0, median: 0, mode: [], min: 0, max: 0, range: 0, variance: 0, stdDev: 0, sum: 0, count: 0 };
  }

  const count = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const sorted = [...numbers].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Median
  let median = 0;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  // Mode
  const freqMap: Record<number, number> = {};
  let maxFreq = 0;
  for (const n of numbers) {
    freqMap[n] = (freqMap[n] || 0) + 1;
    if (freqMap[n] > maxFreq) maxFreq = freqMap[n];
  }
  const mode: number[] = [];
  if (maxFreq > 1) {
    for (const key in freqMap) {
      if (freqMap[key] === maxFreq) mode.push(Number(key));
    }
  }

  // Variance & Standard Deviation
  const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    mode,
    min,
    max,
    range,
    variance: Number(variance.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    sum: Number(sum.toFixed(2)),
    count,
  };
}

// Fractions
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function simplifyFraction(numerator: number, denominator: number) {
  if (denominator === 0) throw new Error('Denominator cannot be zero.');
  const divisor = gcd(numerator, denominator);
  let num = numerator / divisor;
  let den = denominator / divisor;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return { num, den };
}

export function calculateFractions(
  n1: number,
  d1: number,
  n2: number,
  d2: number,
  op: '+' | '-' | '*' | '/'
) {
  if (d1 === 0 || d2 === 0) throw new Error('Denominator cannot be zero.');
  if (op === '/' && n2 === 0) throw new Error('Cannot divide by zero fraction.');

  let resNum = 0;
  let resDen = 1;

  if (op === '+') {
    resNum = n1 * d2 + n2 * d1;
    resDen = d1 * d2;
  } else if (op === '-') {
    resNum = n1 * d2 - n2 * d1;
    resDen = d1 * d2;
  } else if (op === '*') {
    resNum = n1 * n2;
    resDen = d1 * d2;
  } else if (op === '/') {
    resNum = n1 * d2;
    resDen = d1 * n2;
  }

  const simplified = simplifyFraction(resNum, resDen);
  const decimal = simplified.num / simplified.den;

  // Mixed number
  const whole = Math.floor(Math.abs(simplified.num) / simplified.den);
  const remNum = Math.abs(simplified.num) % simplified.den;
  const isNegative = simplified.num < 0;

  return {
    numerator: simplified.num,
    denominator: simplified.den,
    decimal: Number(decimal.toFixed(4)),
    mixed:
      whole > 0 && remNum > 0
        ? `${isNegative ? '-' : ''}${whole} ${remNum}/${simplified.den}`
        : null,
  };
}

// Interest
export function calculateSimpleInterest(principal: number, rate: number, timeYears: number) {
  const interest = (principal * rate * timeYears) / 100;
  const total = principal + interest;
  return {
    interest: Number(interest.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export function calculateCompoundInterest(
  principal: number,
  ratePercent: number,
  timeYears: number,
  compoundsPerYear: number
) {
  const r = ratePercent / 100;
  const n = compoundsPerYear;
  const amount = principal * Math.pow(1 + r / n, n * timeYears);
  const interest = amount - principal;
  return {
    finalAmount: Number(amount.toFixed(2)),
    totalInterest: Number(interest.toFixed(2)),
  };
}

// Discount
export function calculateDiscount(price: number, discountPercent: number, taxPercent = 0) {
  const discountAmount = (price * discountPercent) / 100;
  const discountedPrice = price - discountAmount;
  const taxAmount = (discountedPrice * taxPercent) / 100;
  const finalPrice = discountedPrice + taxAmount;
  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
    totalSavings: Number(discountAmount.toFixed(2)),
  };
}

// Age & Date
export function calculateAge(birthDateStr: string) {
  const birthDate = new Date(birthDateStr);
  const today = new Date();

  if (isNaN(birthDate.getTime()) || birthDate > today) {
    return null;
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const diffMs = today.getTime() - birthDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Next birthday
  const nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBday < today) {
    nextBday.setFullYear(today.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays, daysUntilBirthday };
}

// BMI
export function calculateBMI(weightKg: number, heightCm: number) {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category = 'Normal weight';
  let color = 'text-emerald-500';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-amber-500';
  } else if (bmi < 25) {
    category = 'Normal weight';
    color = 'text-emerald-600';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = 'text-amber-600';
  } else {
    category = 'Obese';
    color = 'text-rose-600';
  }

  const minNormalWeight = 18.5 * (heightM * heightM);
  const maxNormalWeight = 24.9 * (heightM * heightM);

  return {
    bmi: Number(bmi.toFixed(1)),
    category,
    color,
    idealWeightRange: `${minNormalWeight.toFixed(1)} kg - ${maxNormalWeight.toFixed(1)} kg`,
  };
}
