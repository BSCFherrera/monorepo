---
captured: 2026-09-04
source: implementation surprise — ISP-2 mobile app e2e (Appium/UiAutomator2 against React Native 0.87.1)
proposed-layer: guides/idioms/react-native
proposed-globs:
  - "apps/*-e2e/**"
---

## What happened

On React Native 0.87's new-architecture Android build, a component's
`testID` prop is exposed to the native view hierarchy as the Android
**`resource-id`** attribute, not `content-desc` (accessibility
label/id). WebdriverIO's `~testID` selector (the standard "accessibility
id" strategy, and the one every Appium/RN tutorial shows) silently finds
nothing — `findElements` returns an empty array with no error, which
looks identical to "the element hasn't rendered yet" and cost real
debugging time (dumping the live `uiautomator` XML hierarchy was what
actually revealed `resource-id="credit-amount-input"` with an empty
`content-desc`).

The working selector is:
```ts
driver.$('android=new UiSelector().resourceId("credit-amount-input")')
```
A bare `id=testID` locator strategy also fails, because it assumes a
package-qualified resource id (`com.app:id/name`) — RN's testID has no
package prefix.

## Why it matters

`idioms/react-native/mobile-app`'s own rule mandates stable `testID`s
for Appium targeting, but doesn't say how Appium actually resolves them
on this RN version — and the obvious, most-documented selector strategy
(`~testID`) doesn't work. Anyone writing a new Appium spec against an RN
0.87+ app will hit this exact silent "element not found" and burn time
re-deriving the same fix.

## Proposed change

Add to `idioms/react-native/mobile-app`'s rules: on React Native (new
architecture, 0.87+), target `testID` in Appium specs via
`android=new UiSelector().resourceId("<testID>")`, not the `~testID`
accessibility-id selector — the latter finds nothing because `testID`
maps to the native `resource-id` attribute, not `content-desc`. Verify
against the live `uiautomator` dump (`adb shell uiautomator dump`) when
a selector silently returns no elements, rather than assuming a timing
issue.
