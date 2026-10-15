// Constants for the generic UI components. Nothing here knows about steganography.

import type { AriaRole } from 'react';

/** How prominent a button is. */
export const ButtonVariant = {
  /** The main action of a panel or page. */
  PRIMARY: 'primary',
  /** Other actions. */
  SECONDARY: 'secondary',
  /** Small actions without a frame, such as zoom controls. */
  GHOST: 'ghost',
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

/** What a notice tells the user: how work is going, or what went wrong. */
export const NoticeKind = {
  STATUS: 'status',
  PROBLEM: 'problem',
} as const;
export type NoticeKind = (typeof NoticeKind)[keyof typeof NoticeKind];

/** The ARIA role each kind of notice is announced with. */
export const NOTICE_ROLE = {
  [NoticeKind.STATUS]: 'status',
  [NoticeKind.PROBLEM]: 'alert',
} as const satisfies Record<NoticeKind, AriaRole>;

/** Keyboard keys the components respond to, as `KeyboardEvent.key` names them. */
export const Key = {
  ESCAPE: 'Escape',
} as const;

/** DOM events the components listen for on the whole document. */
export const DocumentEvent = {
  POINTER_DOWN: 'pointerdown',
} as const;

/** The zoom levels the image viewer steps through, as scale factors. */
export const ZOOM_STEPS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16] as const;

/** One image pixel per screen pixel. */
export const ACTUAL_SIZE = 1;

/** How close two scales must be to count as the same, to absorb rounding. */
export const SCALE_TOLERANCE = 1e-6;
