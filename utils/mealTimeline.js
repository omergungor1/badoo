function getMealImageUrl(log) {
  return log?.meals?.image_url || log?.image_url || null;
}

function getMealImagePath(log) {
  return log?.meals?.image_path || log?.image_path || null;
}

function getMealTitle(log, items = []) {
  if (log?.meals?.meal_title) return log.meals.meal_title;
  if (log?.meal_title) return log.meal_title;

  const names = items
    .map((item) => item.foods?.food_name || item.food_name)
    .filter(Boolean);

  if (names.length) {
    return names.slice(0, 3).join(', ');
  }

  return 'Öğün';
}

function sumItemMacros(items = []) {
  return items.reduce(
    (acc, item) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.carbohydrates += item.carbohydrates || 0;
      acc.fats += item.fats || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
  );
}

export function isMealPhotoItem(item) {
  return Boolean(item?.logType === 'food' && item?.image_url);
}

/** Meal API / grouped öğünler — timeline kartı olarak gösterilir */
export function isMealCardItem(item) {
  return Boolean(
    item?.logType === 'food' && (item?.isMealGroup || item?.image_url),
  );
}

export function groupFoodLogsForTimeline(foodLogs = []) {
  const groups = new Map();
  const singles = [];

  foodLogs.forEach((log) => {
    if (!log?.meal_id) {
      singles.push({
        ...log,
        logType: 'food',
        sortTime: log.sortTime || log.timestamp,
        image_url: getMealImageUrl(log),
        image_path: getMealImagePath(log),
        meal_title: getMealTitle(log, [log]),
      });
      return;
    }

    if (!groups.has(log.meal_id)) {
      groups.set(log.meal_id, []);
    }
    groups.get(log.meal_id).push(log);
  });

  const grouped = Array.from(groups.entries()).map(([mealId, items]) => {
    const sortedItems = [...items].sort(
      (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
    );
    const primary = sortedItems[0];
    const meal = primary.meals || {};
    const macros = {
      calories: meal.total_calories,
      protein: meal.total_protein,
      carbohydrates: meal.total_carbohydrates,
      fats: meal.total_fats,
    };

    const hasMealTotals = Object.values(macros).some((value) => value != null);
    const fallbackMacros = hasMealTotals ? macros : sumItemMacros(sortedItems);

    return {
      ...primary,
      id: meal.id || mealId,
      meal_id: mealId,
      logType: 'food',
      isMealGroup: true,
      source: meal.source || primary.source || null,
      meal_title: getMealTitle(primary, sortedItems),
      image_url: getMealImageUrl(primary),
      image_path: getMealImagePath(primary),
      calories: fallbackMacros.calories ?? null,
      protein: fallbackMacros.protein ?? null,
      carbohydrates: fallbackMacros.carbohydrates ?? null,
      fats: fallbackMacros.fats ?? null,
      sortTime: meal.eaten_at || primary.timestamp,
      items: sortedItems,
      foods: null,
    };
  });

  return [...grouped, ...singles].sort(
    (a, b) => new Date(b.sortTime || 0) - new Date(a.sortTime || 0),
  );
}
