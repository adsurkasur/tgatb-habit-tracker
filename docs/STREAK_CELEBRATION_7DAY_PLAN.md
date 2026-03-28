# 7-Day Streak Celebration Plan

## Goal

Deliver a milestone celebration experience when a habit reaches a 7-day streak.

The experience includes:

- Celebration overlay with quote
- Confetti visual effect
- Celebration sound effect
- Celebration haptic effect
- Accessibility-aware behavior

Phase 1 supports only the 7-day milestone, but architecture must be ready for future milestones.

## Scope

### In Scope

- Milestone detection for first crossing at day 7
- One-time trigger guard per habit milestone crossing
- Overlay UI and quote rendering
- Confetti effect with adjustable intensity
- Sound + haptic celebration channel
- Accessibility settings for celebration behavior
- Localization keys for celebration UI and quote content
- Developer preview trigger for fast QA

### Out of Scope

- User-facing custom milestone editor
- Multiple active milestones in production behavior (14, 30, 100)
- Historical celebration timeline UI

## Functional Requirements

## Milestone Logic

- Trigger only when streak crosses from less than 7 to greater than or equal to 7.
- Trigger only for positive streak actions:
  - Good habit marked done
  - Bad habit avoided
- Do not retrigger on app reload, simple re-render, or unchanged streak values.
- Undo behavior must support recrossing logic:
  - If streak drops below 7, future recross to 7 can trigger again.

## Celebration Sequence

- Start sequence after tracking persistence succeeds.
- Render overlay and confetti immediately.
- Play sound and haptic synchronized to sequence start.
- Allow dismiss by tap and auto-dismiss by timeout.

## Accessibility and Preference Requirements

- Add celebration-level settings:
  - Celebration effects enabled
  - Celebration sound enabled
  - Celebration haptics enabled
  - Celebration motion mode (full or reduced)
  - Celebration confetti intensity (low, medium, high)
- Respect system reduced-motion preference by default.
- Effective behavior must be intersection of global and celebration settings:
  - Sound plays only if global sound and celebration sound are enabled.
  - Haptics play only if global haptic and celebration haptic are enabled.

## Architecture Plan

## Configuration Layer

Define a milestone configuration object now, with future-ready structure:

- Milestone identifier
- Threshold day count
- Enabled flag
- Reward payload:
  - Quote key
  - Sound preset
  - Haptic preset
  - Confetti preset

Only 7-day milestone is enabled in Phase 1.

## Trigger Layer

Implement milestone evaluator near streak update flow in use-habits.

Responsibilities:

- Detect crossing
- Apply replay guard
- Emit celebration event payload

## Presentation Layer

Create a dedicated celebration overlay component.

Responsibilities:

- Render quote card
- Render confetti effect
- Handle dismiss and timeout
- Respect reduced-motion and intensity settings

## Feedback Layer

Extend feedback orchestration for celebration event:

- Celebration sound mapping
- Celebration haptic mapping

## Persistence Layer

Store enough metadata for replay safety and future milestones:

- Last celebrated milestone per habit
- Last celebrated streak value or date

## File Plan

## Files to Modify

- hooks/use-habits.ts
- lib/feedback.ts
- lib/haptics.ts
- shared/schema.ts
- messages/en.json
- messages/id.json
- additional locale catalogs for key parity

## Files to Create

- components/streak-celebration-overlay.tsx
- lib/streak-celebration.ts
- docs/STREAK_CELEBRATION_7DAY_LOG.md

## Confetti Testing Strategy

## Fast Developer Testing

Add a developer-only preview trigger to launch celebration without waiting for real streaks.

- Trigger from development-only action path
- Emits same payload as real milestone
- Allows rapid tuning of timing, particle count, and visuals

## Functional QA

- Real streak flow 6 to 7 triggers exactly once
- 7 to 8 does not trigger
- Reload does not retrigger
- Undo below 7 then recross to 7 retriggers

## Accessibility QA

- Reduced motion enabled: minimized or static confetti mode
- Celebration sound disabled: silent sequence
- Celebration haptics disabled: no vibration
- Screen reader: overlay title and dismiss are accessible

## Performance QA

- Confetti budget capped by intensity profile
- Test low-end Android for frame stability
- Keep sequence short (target 1.5 to 2.5 seconds)

## Risk Assessment

- Risk: Duplicate celebration events
  - Mitigation: crossing-based trigger plus persisted replay guard
- Risk: Overstimulating effects
  - Mitigation: settings, reduced motion support, short duration
- Risk: Mobile jank from confetti
  - Mitigation: particle cap, short lifetime, lightweight animation strategy
- Risk: Future milestone expansion complexity
  - Mitigation: centralized milestone config and event payload model now

## Plan Review

## Strengths

- Clear trigger boundaries and replay safety
- Accessibility integrated from initial release
- Future milestone readiness without overbuilding phase 1
- QA strategy includes deterministic preview path

## Gaps Closed in This Revision

- Added explicit celebration settings set
- Added global vs celebration preference interaction rules
- Added undo and recross trigger policy
- Added confetti-specific performance testing criteria

## Open Decisions

- Exact quote selection strategy:
  - deterministic rotation
  - weighted random
- Overlay timeout value:
  - fixed duration
  - adaptive based on reduced-motion
- Confetti implementation approach:
  - custom lightweight canvas
  - library with strict performance guardrails

## Phase Execution Order

1. Data and config scaffolding
2. Trigger and replay guard logic
3. Overlay and confetti implementation
4. Sound and haptic celebration wiring
5. Accessibility settings and preference integration
6. Localization and key parity
7. QA and tuning

## Success Criteria

- 7-day milestone celebration triggers correctly and only when expected
- Confetti, quote, sound, and haptic run in synchronized sequence
- Accessibility and global preferences are honored without conflicts
- Mobile app and mobile web behavior remain stable and smooth
- Future milestones can be enabled by config expansion, not architecture rewrite
