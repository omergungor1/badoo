/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'BadooWidgets',
  displayName: 'Badoo',
  icon: '../../assets/icon.png',
  colors: {
    $accent: '#FF7A00',
    $widgetBackground: '#FFFFFF',
  },
  deploymentTarget: '17.0',
  frameworks: ['WidgetKit', 'SwiftUI'],
  entitlements: {
    'com.apple.security.application-groups': ['group.com.omerexpo.badoo'],
  },
});
