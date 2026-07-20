import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import {
  ACADEMY_XP_PER_LESSON,
  getStreakBonus,
} from '../constants/academy';
import { toISODate } from '../utils/date';

function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

async function getOrCreateProgress(userId) {
  const { data, error } = await getDb()
    .from('academy_user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logSupabaseError('getOrCreateProgress', error, { userId });
    return { data: null, error };
  }

  if (data) return { data, error: null };

  const { data: created, error: insertError } = await getDb()
    .from('academy_user_progress')
    .insert({
      user_id: userId,
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      completed_lesson_count: 0,
    })
    .select('*')
    .single();

  if (insertError) {
    logSupabaseError('getOrCreateProgress.insert', insertError, { userId });
    return { data: null, error: insertError };
  }

  return { data: created, error: null };
}

function wasCompletedOnDate(completedAt, isoDate) {
  if (!completedAt) return false;
  return toISODate(new Date(completedAt)) === isoDate;
}

/** Bugün zaten bir ders tamamlandı mı? (günde 1 ders) */
function hasCompletedLessonToday(progress, completedMap) {
  const today = toISODate();
  if (progress?.last_completed_date === today) return true;
  for (const completedAt of completedMap.values()) {
    if (wasCompletedOnDate(completedAt, today)) return true;
  }
  return false;
}

function buildNodes(lessons, completedMap, progress) {
  const completedToday = hasCompletedLessonToday(progress, completedMap);
  let openedSlot = false;

  return (lessons || []).map((lesson) => {
    const isCompleted = completedMap.has(lesson.id);
    let status = 'locked';

    if (isCompleted) {
      status = 'completed';
    } else if (!completedToday && !openedSlot) {
      // Bugün henüz ders yapılmadı → tek açık ders
      status = 'today';
      openedSlot = true;
    } else if (completedToday && !openedSlot) {
      // Bugünkü ders bitti → sıradaki yarın açılır
      status = 'tomorrow';
      openedSlot = true;
    }

    return {
      ...lesson,
      status,
      completedAt: completedMap.get(lesson.id) || null,
    };
  });
}

export async function getAcademyHomeSummary(userId) {
  const [{ data: progress }, lessonsRes, badgesRes, completedRes] = await Promise.all([
    getOrCreateProgress(userId),
    getDb()
      .from('academy_lessons')
      .select('id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, xp_reward, series:series_id(series_key, title, emoji)')
      .eq('is_published', true)
      .order('day_number', { ascending: true }),
    getDb()
      .from('academy_user_badges')
      .select('earned_at, badge:badge_id(badge_key, title, emoji)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(1),
    getDb()
      .from('academy_user_lessons')
      .select('lesson_id, completed_at')
      .eq('user_id', userId),
  ]);

  if (lessonsRes.error) {
    logSupabaseError('getAcademyHomeSummary.lessons', lessonsRes.error, { userId });
    return { data: null, error: lessonsRes.error };
  }

  const lessons = lessonsRes.data || [];
  const completedMap = new Map((completedRes.data || []).map((row) => [row.lesson_id, row.completed_at]));
  const nodes = buildNodes(lessons, completedMap, progress?.data);
  const todayNode = nodes.find((node) => node.status === 'today') || null;
  const tomorrowNode = nodes.find((node) => node.status === 'tomorrow') || null;
  const todayCompleted = hasCompletedLessonToday(progress?.data, completedMap);
  const completedCount = completedMap.size;

  return {
    data: {
      progress: progress?.data || null,
      todayLesson: todayNode,
      nextLesson: tomorrowNode,
      todayCompleted,
      journeyProgress: lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0,
      completedCount,
      totalLessons: lessons.length,
      latestBadge: badgesRes.data?.[0]?.badge || null,
    },
    error: null,
  };
}

export async function getAcademyMap(userId) {
  const [{ data: progress }, { data: lessons, error }, { data: completedRows }, { data: badges }, { data: earnedBadges }] =
    await Promise.all([
      getOrCreateProgress(userId),
      getDb()
        .from('academy_lessons')
        .select('id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty, xp_reward, series:series_id(series_key, title, emoji)')
        .eq('is_published', true)
        .order('day_number', { ascending: true }),
      getDb()
        .from('academy_user_lessons')
        .select('lesson_id, completed_at')
        .eq('user_id', userId),
      getDb()
        .from('academy_badges')
        .select('*')
        .order('sort_order', { ascending: true }),
      getDb()
        .from('academy_user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', userId),
    ]);

  if (error) {
    logSupabaseError('getAcademyMap', error, { userId });
    return { data: null, error };
  }

  const completedMap = new Map((completedRows || []).map((row) => [row.lesson_id, row.completed_at]));
  const earnedSet = new Set((earnedBadges || []).map((row) => row.badge_id));
  const nodes = buildNodes(lessons, completedMap, progress?.data);

  return {
    data: {
      progress: progress?.data || null,
      nodes,
      badges: (badges || []).map((badge) => ({
        ...badge,
        earned: earnedSet.has(badge.id),
      })),
      completedCount: completedMap.size,
      totalLessons: (lessons || []).length,
      journeyPercent: (lessons || []).length
        ? Math.round((completedMap.size / lessons.length) * 100)
        : 0,
    },
    error: null,
  };
}

export async function getAcademyLesson(userId, lessonId) {
  const [{ data: lesson, error }, { data: completion }, mapRes] = await Promise.all([
    getDb()
      .from('academy_lessons')
      .select('*, series:series_id(series_key, title, emoji)')
      .eq('id', lessonId)
      .maybeSingle(),
    getDb()
      .from('academy_user_lessons')
      .select('id, completed_at, xp_earned, streak_bonus')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle(),
    getAcademyMap(userId),
  ]);

  if (error) {
    logSupabaseError('getAcademyLesson', error, { userId, lessonId });
    return { data: null, error };
  }

  if (!lesson) {
    return { data: null, error: { message: 'Ders bulunamadı.' } };
  }

  const node = mapRes.data?.nodes?.find((item) => item.id === lessonId);
  const locked = node?.status === 'locked' || node?.status === 'tomorrow';

  return {
    data: {
      lesson,
      completion,
      locked,
      status: node?.status || 'locked',
    },
    error: null,
  };
}

async function awardBadges(userId, { completedCount, currentStreak, lessonBadgeKey }) {
  const { data: badges } = await getDb().from('academy_badges').select('*');
  const { data: owned } = await getDb()
    .from('academy_user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const ownedIds = new Set((owned || []).map((row) => row.badge_id));
  const newlyEarned = [];

  for (const badge of badges || []) {
    if (ownedIds.has(badge.id)) continue;

    let shouldEarn = false;
    if (badge.unlock_type === 'lessons' && completedCount >= (badge.unlock_value || 0)) {
      shouldEarn = true;
    }
    if (badge.unlock_type === 'streak' && currentStreak >= (badge.unlock_value || 0)) {
      shouldEarn = true;
    }
    if (badge.unlock_type === 'manual' && lessonBadgeKey && badge.badge_key === lessonBadgeKey) {
      shouldEarn = true;
    }

    if (!shouldEarn) continue;

    const { data: inserted, error } = await getDb()
      .from('academy_user_badges')
      .insert({ user_id: userId, badge_id: badge.id })
      .select('*, badge:badge_id(*)')
      .single();

    if (!error && inserted) {
      newlyEarned.push(inserted.badge || badge);
    }
  }

  return newlyEarned;
}

export async function completeAcademyLesson(userId, lessonId) {
  const { data: existing } = await getDb()
    .from('academy_user_lessons')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (existing) {
    return { data: null, error: { message: 'Bu ders zaten tamamlandı.' } };
  }

  const access = await getAcademyLesson(userId, lessonId);
  if (access.error) return access;
  if (access.data.locked) {
    return { data: null, error: { message: 'Bu ders henüz kilitli. Yarın tekrar dene.' } };
  }

  const lesson = access.data.lesson;
  const { data: progress } = await getOrCreateProgress(userId);
  const today = toISODate();
  const lastDate = progress?.last_completed_date || null;

  if (lastDate === today) {
    return { data: null, error: { message: 'Bugünkü dersini zaten tamamladın. Yarın yeni ders açılacak.' } };
  }

  let nextStreak = 1;
  if (lastDate && daysBetween(lastDate, today) === 1) {
    nextStreak = (progress.current_streak || 0) + 1;
  }

  const streakBonus = getStreakBonus(nextStreak);
  const baseXp = lesson.xp_reward || ACADEMY_XP_PER_LESSON;
  const xpEarned = baseXp + streakBonus;
  const completedCount = (progress?.completed_lesson_count || 0) + 1;
  const longestStreak = Math.max(progress?.longest_streak || 0, nextStreak);

  const { error: lessonInsertError } = await getDb()
    .from('academy_user_lessons')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      xp_earned: xpEarned,
      streak_bonus: streakBonus,
    });

  if (lessonInsertError) {
    logSupabaseError('completeAcademyLesson.insert', lessonInsertError, { userId, lessonId });
    return { data: null, error: lessonInsertError };
  }

  const { data: updatedProgress, error: progressError } = await getDb()
    .from('academy_user_progress')
    .update({
      total_xp: (progress?.total_xp || 0) + xpEarned,
      current_streak: nextStreak,
      longest_streak: longestStreak,
      last_completed_date: today,
      completed_lesson_count: completedCount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (progressError) {
    logSupabaseError('completeAcademyLesson.progress', progressError, { userId });
    return { data: null, error: progressError };
  }

  const newBadges = await awardBadges(userId, {
    completedCount,
    currentStreak: nextStreak,
    lessonBadgeKey: lesson.badge_key,
  });

  return {
    data: {
      progress: updatedProgress,
      xpEarned,
      baseXp,
      streakBonus,
      newBadges,
      motivation: lesson.motivation,
    },
    error: null,
  };
}
