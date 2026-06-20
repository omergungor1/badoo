export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Zayıf';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Fazla kilolu';
  return 'Obez';
}

export function getWeightAdvice(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = calculateBMI(weightKg, heightCm);
  const minIdeal = Math.round(18.5 * heightM * heightM);
  const maxIdeal = Math.round(24.9 * heightM * heightM);

  if (bmi < 18.5) {
    const diff = minIdeal - weightKg;
    return {
      bmi,
      category: getBMICategory(bmi),
      message: `${diff} kg almanız tavsiye ediliyor.`,
      idealRange: `${minIdeal}-${maxIdeal} kg`,
    };
  }

  if (bmi > 24.9) {
    const diff = weightKg - maxIdeal;
    return {
      bmi,
      category: getBMICategory(bmi),
      message: `${diff} kg vermeniz tavsiye ediliyor.`,
      idealRange: `${minIdeal}-${maxIdeal} kg`,
    };
  }

  return {
    bmi,
    category: getBMICategory(bmi),
    message: 'Kilonuz ideal aralıkta görünüyor.',
    idealRange: `${minIdeal}-${maxIdeal} kg`,
  };
}

export function calculateDailyTargets({ birthYear, gender, height, weight, goals = [] }) {
  const age = new Date().getFullYear() - birthYear;
  let bmr;

  if (gender === 'erkek') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  let calories = Math.round(bmr * 1.375);
  let protein = Math.round(weight * 1.6);

  if (goals.includes('Kilo vermek')) {
    calories -= 400;
    protein = Math.round(weight * 2);
  }

  if (goals.includes('Kilo almak')) {
    calories += 400;
  }

  if (goals.includes('Protein takibi yapmak')) {
    protein = Math.round(weight * 2);
  }

  const water = Math.round(weight * 35);

  return {
    calories,
    protein,
    water,
    activity: 10000,
    bmi: calculateBMI(weight, height),
  };
}

export function formatWater(ml) {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${ml} ml`;
}
