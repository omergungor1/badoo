import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { PROFILE_WIDGETS, WIDGET_ADD_INSTRUCTIONS, WIDGET_FAMILY } from '../../constants/widgetCatalog';
import { WIDGET_KINDS } from '../../constants/widgets';
import { getActivityGoal } from '../../utils/activity';
import { profilePageColors } from './ProfileSection';
import { colors, spacing, typography } from '../../theme';

const MEDIUM_WIDTH = 300;
const MEDIUM_HEIGHT = 200;
const LOCK_WIDTH = 280;
const LOCK_HEIGHT = 64;
const CARD_META_HEIGHT = 48;
const SCROLL_AREA_HEIGHT = MEDIUM_HEIGHT + spacing.sm + CARD_META_HEIGHT + spacing.sm * 2 + spacing.md;
const ACCENT_BLUE = '#2E8CFF';
const CALORIE_TEXT = '#8CC7FF';
const FLAME_ORANGE = '#FF7A00';

function WidgetGradient({ gradId, colors: gradientColors, style, children }) {
  return (
    <View style={[style, styles.gradientWrap]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
      {children}
    </View>
  );
}

function QuickActionItem({ icon, title, subtitle }) {
  return (
    <View style={styles.quickActionItem}>
      <View style={styles.quickActionIconWrap}>
        <View style={styles.quickActionIconCircle}>
          <Ionicons name={icon} size={16} color="#FFFFFF" />
        </View>
        <View style={styles.quickActionPlus}>
          <Ionicons name="add" size={8} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.quickActionTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.quickActionSubtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

function QuickActionsHomePreview({ widget, gradId }) {
  return (
    <WidgetGradient
      gradId={gradId}
      colors={widget.gradient}
      style={[styles.widgetBody, styles.mediumWidget]}
    >
      <View style={styles.quickActionsHeader}>
        <Text style={styles.quickActionsHeading}>Hızlı ekle</Text>
        <Text style={styles.quickActionsBrand}>Badoo</Text>
      </View>
      <View style={styles.quickActionsRow}>
        {widget.actions.map((action) => (
          <QuickActionItem key={action.title} {...action} />
        ))}
      </View>
    </WidgetGradient>
  );
}

function QuickActionsLockPreview({ widget, gradId }) {
  return (
    <WidgetGradient
      gradId={gradId}
      colors={widget.gradient}
      style={[styles.widgetBody, styles.lockWidget]}
    >
      <View style={styles.lockQuickActionsRow}>
        {widget.actions.map((action) => (
          <Ionicons key={action.title} name={action.icon} size={18} color="#FFFFFF" />
        ))}
      </View>
    </WidgetGradient>
  );
}

function NutritionMiniStat({ icon, value, label }) {
  return (
    <View style={styles.miniStat}>
      <Ionicons name={icon} size={10} color="rgba(255,255,255,0.85)" />
      <View style={styles.miniStatText}>
        <Text style={styles.miniStatValue} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.miniStatLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function NutritionHomePreview({ widget, nutrition, gradId }) {
  const progressWidth = `${Math.max(3, nutrition.calorieProgress * 100)}%`;

  return (
    <WidgetGradient
      gradId={gradId}
      colors={widget.gradient}
      style={[styles.widgetBody, styles.mediumWidget]}
    >
      <View style={styles.nutritionTopRow}>
        <Ionicons name="flame" size={14} color={FLAME_ORANGE} />
        <Text style={styles.nutritionCalories}>{nutrition.caloriesLeft}</Text>
        <Text style={styles.nutritionCaloriesLabel}>kcal kaldı</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <View style={styles.miniStatsRow}>
        <NutritionMiniStat icon="flash" value={`${nutrition.protein}g`} label="Protein" />
        <NutritionMiniStat icon="leaf" value={`${nutrition.waterLeft}ml`} label="Su kaldı" />
        <NutritionMiniStat
          icon="walk"
          value={nutrition.activityValue}
          label={nutrition.activityLabel}
        />
      </View>
    </WidgetGradient>
  );
}

function NutritionLockPreview({ widget, nutrition, gradId }) {
  return (
    <WidgetGradient
      gradId={gradId}
      colors={widget.gradient}
      style={[styles.widgetBody, styles.lockWidget]}
    >
      <View style={styles.lockNutritionRow}>
        <Ionicons name="flame" size={13} color={FLAME_ORANGE} />
        <Text style={styles.lockNutritionText}>
          {nutrition.calories}/{nutrition.calorieGoal} kcal
        </Text>
        <View style={styles.lockNutritionSpacer} />
        <Text style={styles.lockNutritionText}>{nutrition.protein}g</Text>
        <Text style={styles.lockNutritionText}>{nutrition.water}ml</Text>
      </View>
    </WidgetGradient>
  );
}

function WidgetPreview({ widget, nutrition }) {
  const gradId = `widget-grad-${widget.key}`;
  const isLock = widget.family === WIDGET_FAMILY.accessoryRectangular;

  if (widget.kind === WIDGET_KINDS.quickActions) {
    return isLock ? (
      <QuickActionsLockPreview widget={widget} gradId={gradId} />
    ) : (
      <QuickActionsHomePreview widget={widget} gradId={gradId} />
    );
  }

  return isLock ? (
    <NutritionLockPreview widget={widget} nutrition={nutrition} gradId={gradId} />
  ) : (
    <NutritionHomePreview widget={widget} nutrition={nutrition} gradId={gradId} />
  );
}

function WidgetPreviewCard({ widget, nutrition }) {
  const isLock = widget.family === WIDGET_FAMILY.accessoryRectangular;

  return (
    <View style={styles.card}>
      <View style={[styles.previewFrame, isLock && styles.previewFrameLock]}>
        <WidgetPreview widget={widget} nutrition={nutrition} />
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.cardTitle}>{widget.title}</Text>
        <Text style={styles.cardScreen}>{widget.screen}</Text>
      </View>
    </View>
  );
}

function showWidgetInstructions() {
  Alert.alert('Widget nasıl eklenir?', WIDGET_ADD_INSTRUCTIONS.join('\n\n'));
}

function buildNutritionPreview(profile) {
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const proteinGoal = profile?.daily_protein_goal || 100;
  const waterGoal = profile?.daily_water_goal || 2000;
  const activityGoal = getActivityGoal(profile);

  return {
    calories: 0,
    caloriesLeft: calorieGoal,
    calorieGoal,
    calorieProgress: 0,
    protein: 0,
    water: 0,
    waterLeft: waterGoal,
    activityValue: '0',
    activityLabel: activityGoal.config.label,
    proteinGoal,
    waterGoal,
  };
}

export default function ProfileWidgetsSection({ profile }) {
  const nutrition = buildNutritionPreview(profile);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Widget'lar</Text>
        <Pressable onPress={showWidgetInstructions} hitSlop={8}>
          <Text style={styles.sectionLink}>Nasıl eklenir?</Text>
        </Pressable>
      </View>

      <View style={styles.scrollHost}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          removeClippedSubviews={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {PROFILE_WIDGETS.map((widget) => (
            <WidgetPreviewCard key={widget.key} widget={widget} nutrition={nutrition} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    overflow: 'visible',
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: profilePageColors.sectionTitle,
  },
  sectionLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  scrollHost: {
    height: SCROLL_AREA_HEIGHT,
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  card: {
    width: MEDIUM_WIDTH,
    marginRight: spacing.md,
    overflow: 'visible',
  },
  previewFrame: {
    width: MEDIUM_WIDTH,
    height: MEDIUM_HEIGHT,
    overflow: 'visible',
  },
  previewFrameLock: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMeta: {
    marginTop: spacing.sm,
    minHeight: CARD_META_HEIGHT,
    justifyContent: 'center',
    gap: 2,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  cardScreen: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: typography.bodySemiBold.fontFamily,
    lineHeight: 16,
  },
  gradientWrap: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    width: '100%',
    height: '100%',
  },
  widgetBody: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mediumWidget: {
    width: MEDIUM_WIDTH,
    height: MEDIUM_HEIGHT,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
    justifyContent: 'flex-start',
    gap: 10,
  },
  lockWidget: {
    width: LOCK_WIDTH,
    height: LOCK_HEIGHT,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionsHeading: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: 'rgba(255,255,255,0.92)',
  },
  quickActionsBrand: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: 'rgba(255,255,255,0.55)',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionPlus: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  quickActionSubtitle: {
    fontSize: 9,
    lineHeight: 11,
    color: 'rgba(255,255,255,0.65)',
    includeFontPadding: false,
  },
  lockQuickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  nutritionTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  nutritionCalories: {
    fontSize: 28,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: CALORIE_TEXT,
    lineHeight: 32,
    includeFontPadding: false,
  },
  nutritionCaloriesLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: 'rgba(255,255,255,0.85)',
    includeFontPadding: false,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: CALORIE_TEXT,
    minWidth: 8,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  miniStatText: {
    flex: 1,
  },
  miniStatValue: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  miniStatLabel: {
    fontSize: 8,
    lineHeight: 10,
    color: 'rgba(255,255,255,0.65)',
    includeFontPadding: false,
  },
  lockNutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockNutritionText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  lockNutritionSpacer: {
    flex: 1,
  },
});
