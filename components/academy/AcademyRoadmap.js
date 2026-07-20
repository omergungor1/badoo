import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getMascotForDay } from '../../constants/mascots';
import { colors, radius, spacing, typography } from '../../theme';

const ZIGZAG = [0, 72, 20, -72, 0, 72, -20, -72];

function nodeOffset(index) {
  return ZIGZAG[index % ZIGZAG.length];
}

function PathConnector({ active }) {
  return (
    <View style={styles.connectorWrap}>
      <View style={[styles.connector, active && styles.connectorActive]} />
    </View>
  );
}

function StartBubble({ label }) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.bubbleText}>{label}</Text>
      <View style={styles.bubbleTail} />
    </View>
  );
}

export default function AcademyRoadmap({ nodes, onPressNode }) {
  const ordered = [...(nodes || [])];

  return (
    <View style={styles.map}>
      {ordered.map((node, index) => {
        const isCompleted = node.status === 'completed';
        const isToday = node.status === 'today';
        const isTomorrow = node.status === 'tomorrow';
        const locked = node.status === 'locked' || isTomorrow;
        const offset = nodeOffset(index);
        const showMascot = isToday || isTomorrow;
        const mascot = getMascotForDay(node.day_number);

        return (
          <View key={node.id} style={styles.row}>
            {index > 0 ? <PathConnector active={isCompleted || isToday} /> : null}

            <View style={[styles.nodeRow, { transform: [{ translateX: offset }] }]}>
              {showMascot && offset <= 0 ? (
                <Image source={mascot} style={styles.sideMascot} resizeMode="contain" />
              ) : (
                <View style={styles.sideSpacer} />
              )}

              <View style={styles.nodeColumn}>
                {isToday ? <StartBubble label="BAŞLA" /> : null}
                {isTomorrow ? <StartBubble label="YARIN" /> : null}

                <Pressable
                  onPress={() => onPressNode?.(node)}
                  style={({ pressed }) => [
                    styles.node,
                    pressed && styles.nodePressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Gün ${node.day_number}: ${node.title}`}
                >
                  <View
                    style={[
                      styles.nodeFace,
                      isCompleted && styles.nodeFaceCompleted,
                      isToday && styles.nodeFaceToday,
                      locked && !isCompleted && styles.nodeFaceLocked,
                    ]}
                  >
                    <Text style={styles.nodeEmoji}>
                      {isCompleted ? '✓' : locked ? '🔒' : node.cover_emoji || '📘'}
                    </Text>
                  </View>
                </Pressable>

                <Text style={[styles.nodeDay, isToday && styles.nodeDayActive]}>
                  Gün {node.day_number}
                </Text>
                <Text
                  style={[styles.nodeTitle, locked && !isCompleted && styles.nodeTitleLocked]}
                  numberOfLines={2}
                >
                  {node.title}
                </Text>
              </View>

              {showMascot && offset > 0 ? (
                <Image source={mascot} style={styles.sideMascot} resizeMode="contain" />
              ) : (
                <View style={styles.sideSpacer} />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const NODE_SIZE = 78;

const styles = StyleSheet.create({
  map: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 0,
  },
  row: {
    width: '100%',
    alignItems: 'center',
  },
  connectorWrap: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 6,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#D4D4D8',
  },
  connectorActive: {
    backgroundColor: '#86EFAC',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 120,
  },
  sideMascot: {
    width: 72,
    height: 72,
  },
  sideSpacer: {
    width: 72,
  },
  nodeColumn: {
    width: 140,
    alignItems: 'center',
    gap: 6,
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    left: '42%',
    width: 12,
    height: 12,
    backgroundColor: colors.white,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeFace: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#58CC02',
    borderBottomWidth: 6,
    borderBottomColor: '#46A302',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  nodeFaceCompleted: {
    backgroundColor: '#58CC02',
    borderBottomColor: '#46A302',
  },
  nodeFaceToday: {
    backgroundColor: '#1CB0F6',
    borderBottomColor: '#1899D6',
  },
  nodeFaceLocked: {
    backgroundColor: '#E5E5E5',
    borderBottomColor: '#AFAFAF',
  },
  nodePressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.95,
  },
  nodeEmoji: {
    fontSize: 28,
    color: colors.white,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  nodeDay: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  nodeDayActive: {
    color: '#1CB0F6',
  },
  nodeTitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: typography.bodySemiBold.fontFamily,
    lineHeight: 18,
  },
  nodeTitleLocked: {
    color: colors.textMuted,
  },
});
