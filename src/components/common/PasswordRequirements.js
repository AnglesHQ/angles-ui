'use client';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PASSWORD_RULES } from '../../utility/PasswordUtilities';

/**
 * PasswordRequirements — renders the password strength policy as a checklist, marking each
 * rule as met or unmet as the user types. Purely presentational; validation itself lives in
 * utility/PasswordUtilities.js and is re-enforced by the API.
 *
 * Props:
 *   password {string} — the current password value to evaluate the rules against
 */
export default function PasswordRequirements({ password = '' }) {
    return (
        <ul className="password-requirements">
            {PASSWORD_RULES.map((rule) => {
                const met = rule.test(String(password || ''));
                return (
                    <li
                        key={rule.messageId}
                        className={met ? 'password-requirement met' : 'password-requirement unmet'}
                    >
                        <span className="password-requirement-icon" aria-hidden="true">{met ? '✓' : '○'}</span>
                        <FormattedMessage id={rule.messageId} />
                    </li>
                );
            })}
        </ul>
    );
}
