import { Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const defaultStyles = {
  h1: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md },
  h2: { ...typography.bodySemiBold, color: colors.textPrimary, marginTop: spacing.md, fontSize: 17 },
  h3: { ...typography.bodySemiBold, color: colors.textPrimary, marginTop: spacing.sm },
  subheading: { ...typography.bodySemiBold, color: colors.textPrimary, marginTop: spacing.xs },
  paragraph: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  bullet: { ...typography.body, color: colors.textPrimary, lineHeight: 22, paddingLeft: spacing.sm },
  bold: { fontFamily: typography.bodySemiBold.fontFamily },
  italic: { fontStyle: 'italic' },
  spacer: { height: spacing.xs },
};

function parseInlineParts(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match = regex.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith('**')) {
      parts.push({ type: 'bold', value: raw.slice(2, -2) });
    } else {
      parts.push({ type: 'italic', value: raw.slice(1, -1) });
    }

    lastIndex = match.index + raw.length;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
}

function InlineText({ text, baseStyle, styles }) {
  const parts = parseInlineParts(text);

  if (parts.length === 1 && parts[0].type === 'text') {
    return <Text style={baseStyle}>{text}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => {
        if (part.type === 'bold') {
          return (
            <Text key={`b-${index}`} style={styles.bold}>
              {part.value}
            </Text>
          );
        }

        if (part.type === 'italic') {
          return (
            <Text key={`i-${index}`} style={styles.italic}>
              {part.value}
            </Text>
          );
        }

        return part.value;
      })}
    </Text>
  );
}

function getHeadingLevel(line) {
  const match = line.match(/^(#{1,3})\s+(.+)$/);
  if (!match) return null;

  return {
    level: match[1].length,
    text: match[2].trim(),
  };
}

export default function MarkdownText({ children, styleMap = {} }) {
  const styles = { ...defaultStyles, ...styleMap };

  if (!children) return null;

  const lines = String(children).split('\n');

  return (
    <View style={{ gap: 2 }}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <View key={`space-${index}`} style={styles.spacer} />;
        }

        const heading = getHeadingLevel(trimmed);
        if (heading) {
          const headingStyle =
            heading.level === 1 ? styles.h1 : heading.level === 2 ? styles.h2 : styles.h3;

          return (
            <InlineText
              key={`h-${index}`}
              text={heading.text}
              baseStyle={headingStyle}
              styles={styles}
            />
          );
        }

        if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
          return (
            <InlineText
              key={`sub-${index}`}
              text={trimmed.slice(2, -2)}
              baseStyle={styles.subheading}
              styles={styles}
            />
          );
        }

        if (/^[-•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-•]\s+/, '');
          return (
            <View key={`bullet-${index}`} style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Text style={styles.bullet}>•</Text>
              <View style={{ flex: 1 }}>
                <InlineText text={content} baseStyle={styles.paragraph} styles={styles} />
              </View>
            </View>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/);
          return (
            <View key={`num-${index}`} style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Text style={styles.bullet}>{numbered[1]}.</Text>
              <View style={{ flex: 1 }}>
                <InlineText text={numbered[2]} baseStyle={styles.paragraph} styles={styles} />
              </View>
            </View>
          );
        }

        return (
          <InlineText
            key={`p-${index}`}
            text={trimmed}
            baseStyle={styles.paragraph}
            styles={styles}
          />
        );
      })}
    </View>
  );
}
